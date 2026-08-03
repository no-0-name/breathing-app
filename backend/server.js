const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const DATA_PATH = path.join(__dirname, 'data.json');

// Режим тестирования
const TEST_MODE = process.env.TEST_MODE === 'true';

let premiumUsers = new Set();
let userPurchases = {};

function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, 'utf8');
      const data = JSON.parse(raw);
      premiumUsers = new Set(data.premiumUsers || []);
      userPurchases = data.userPurchases || {};
    } else {
      saveData();
    }
  } catch {
    premiumUsers = new Set();
    userPurchases = {};
  }
}

function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify({
    premiumUsers: Array.from(premiumUsers),
    userPurchases
  }, null, 2));
}

loadData();

const products = {
  premium: { title: 'Премиум-доступ', description: 'Все техники + статистика + звуки', price: 199 },
  donate_50: { title: 'Поддержка 50 ⭐', description: 'Спасибо!', price: 50 },
  donate_100: { title: 'Поддержка 100 ⭐', description: 'Огромное спасибо!', price: 100 },
  donate_300: { title: 'Поддержка 300 ⭐', description: 'Вы невероятны!', price: 300 },
};

// Функция для обработки успешного платежа (общая для реального и тестового)
function handleSuccessfulPayment(userId, productId, amount) {
  if (!userPurchases[userId]) userPurchases[userId] = [];
  userPurchases[userId].push({
    productId,
    date: new Date().toISOString(),
    amount,
  });

  if (productId === 'premium') {
    premiumUsers.add(String(userId));
    saveData();
    try {
      axios.post(`${BASE_URL}/sendMessage`, {
        chat_id: userId,
        text: '🎉 Премиум-доступ активирован! Спасибо за покупку.',
      });
    } catch (e) {}
  } else if (productId.startsWith('donate')) {
    try {
      axios.post(`${BASE_URL}/sendMessage`, {
        chat_id: userId,
        text: '❤️ Спасибо за вашу поддержку!',
      });
    } catch (e) {}
  }
}

// --- Эндпоинт создания инвойса (с тестовым режимом) ---
app.post('/api/create-invoice', async (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId || !Number.isSafeInteger(Number(userId))) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  const product = products[productId];
  if (!product) return res.status(400).json({ error: 'Unknown product' });

  if (TEST_MODE) {
    // В тестовом режиме возвращаем фейковую ссылку
    // и сохраняем в памяти, что инвойс создан (чтобы потом принять вебхук)
    // Можно вернуть ссылку на эндпоинт, который вызовет вебхук, но проще просто вернуть "тестовую"
    const fakeLink = `https://test-payment/${userId}/${productId}`;
    res.json({ invoiceLink: fakeLink, test: true });
    return;
  }

  // Реальный режим
  try {
    const resp = await axios.post(`${BASE_URL}/createInvoiceLink`, {
      title: product.title,
      description: product.description,
      payload: JSON.stringify({ userId, productId }),
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: product.title, amount: product.price }],
    });
    res.json({ invoiceLink: resp.data.result });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// --- Тестовый эндпоинт для имитации вебхука ---
app.post('/test-webhook', (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId || !Number.isSafeInteger(Number(userId))) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  const product = products[productId];
  if (!product) return res.status(400).json({ error: 'Unknown product' });

  handleSuccessfulPayment(userId, productId, product.price);
  res.json({ success: true, message: 'Тестовый платёж обработан' });
});

// --- Реальный вебхук (без изменений) ---
app.post('/webhook', async (req, res) => {
  const update = req.body;

  if (update.pre_checkout_query) {
    const query = update.pre_checkout_query;
    let payload;
    try { payload = JSON.parse(query.invoice_payload); } catch { return res.sendStatus(200); }
    const userId = payload.userId;
    const productId = payload.productId;

    let ok = true;
    let errorMessage = '';
    if (productId === 'premium' && premiumUsers.has(String(userId))) {
      ok = false;
      errorMessage = 'У вас уже есть премиум-доступ';
    }

    try {
      await axios.post(`${BASE_URL}/answerPreCheckoutQuery`, {
        pre_checkout_query_id: query.id,
        ok,
        error_message: errorMessage,
      });
    } catch (e) {}
    return res.sendStatus(200);
  }

  if (update.message?.successful_payment) {
    const payment = update.message.successful_payment;
    let payload;
    try { payload = JSON.parse(payment.invoice_payload); } catch { return res.sendStatus(200); }
    const userId = payload.userId;
    const productId = payload.productId;

    if (!products[productId]) return res.sendStatus(200);

    handleSuccessfulPayment(userId, productId, products[productId].price);
    saveData();
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

app.get('/api/check-premium', (req, res) => {
  const userId = req.query.userId;
  if (!userId || !Number.isSafeInteger(Number(userId))) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  res.json({ isPremium: premiumUsers.has(String(userId)) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (TEST_MODE) console.log('🔬 TEST MODE ENABLED — используйте /test-webhook для имитации платежа');
});