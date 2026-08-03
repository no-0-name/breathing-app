const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

const premiumUsers = new Set();
const userPurchases = {};

app.post('/api/create-invoice', async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: 'Missing userId or productId' });
  }

  const products = {
    premium: {
      title: 'Премиум-доступ',
      description: 'Все техники + статистика + звуки',
      price: 199,
    },
    donate_50: { title: 'Поддержка 50 ⭐', description: 'Спасибо!', price: 50 },
    donate_100: { title: 'Поддержка 100 ⭐', description: 'Огромное спасибо!', price: 100 },
    donate_300: { title: 'Поддержка 300 ⭐', description: 'Вы невероятны!', price: 300 },
  };

  const product = products[productId];
  if (!product) {
    return res.status(400).json({ error: 'Unknown product' });
  }

  try {
    const response = await axios.post(`${BASE_URL}/createInvoiceLink`, {
      title: product.title,
      description: product.description,
      payload: JSON.stringify({ userId, productId }),
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: product.title, amount: product.price }],
    });

    const invoiceLink = response.data.result;
    res.json({ invoiceLink });
  } catch (error) {
    console.error('createInvoice error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.post('/webhook', async (req, res) => {
  const update = req.body;

  if (update.pre_checkout_query) {
    const query = update.pre_checkout_query;
    try {
      await axios.post(`${BASE_URL}/answerPreCheckoutQuery`, {
        pre_checkout_query_id: query.id,
        ok: true,
      });
    } catch (error) {
      console.error('answerPreCheckoutQuery error:', error.message);
    }
    return res.sendStatus(200);
  }

  if (update.message?.successful_payment) {
    const payment = update.message.successful_payment;
    const payload = JSON.parse(payment.invoice_payload);
    const userId = payload.userId;
    const productId = payload.productId;

    if (!userPurchases[userId]) userPurchases[userId] = [];
    userPurchases[userId].push({ productId, date: new Date() });

    if (productId === 'premium') {
      premiumUsers.add(userId);
      try {
        await axios.post(`${BASE_URL}/sendMessage`, {
          chat_id: userId,
          text: '🎉 Премиум-доступ активирован! Спасибо за покупку.',
        });
      } catch (e) {}
    } else if (productId.startsWith('donate')) {
      try {
        await axios.post(`${BASE_URL}/sendMessage`, {
          chat_id: userId,
          text: '❤️ Спасибо за вашу поддержку!',
        });
      } catch (e) {}
    }
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

app.get('/api/check-premium', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const isPremium = premiumUsers.has(userId);
  res.json({ isPremium });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});