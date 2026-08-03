import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useTelegramPayments() {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const checkPremium = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/check-premium?userId=${userId}`);
      const data = await res.json();
      setIsPremium(data.isPremium);
    } catch (error) {
      console.error('checkPremium error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = (window.Telegram?.WebApp as any)?.initDataUnsafe?.user?.id;
    if (userId) {
      checkPremium(userId.toString());
    } else {
      setLoading(false);
    }
  }, []);

  const purchase = async (userId: string, productId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await res.json();
      if (data.invoiceLink) {
        (window.Telegram?.WebApp as any)?.openInvoice(data.invoiceLink, (status: string) => {
          if (status === 'paid') {
            alert('Оплата прошла успешно!');
            checkPremium(userId);
          } else {
            alert('Платёж не завершён или отменён.');
          }
        });
      } else {
        alert('Не удалось создать платёж.');
      }
    } catch (error) {
      console.error('purchase error:', error);
      alert('Ошибка сервера. Попробуйте позже.');
    }
  };

  return { isPremium, loading, purchase };
}

// import { useState } from 'react';

// export function useTelegramPayments() {
//   const [isPremium] = useState<boolean>(true);
//   const [loading] = useState<boolean>(false);

//   const purchase = async (userId: string, productId: string) => {
//     alert('Тестовый режим: покупка отключена');
//   };

//   return { isPremium, loading, purchase };
// }