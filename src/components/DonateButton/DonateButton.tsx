import { useTelegramPayments } from '../../hooks/useTelegramPayments';
import './DonateButton.css';

const DONATE_AMOUNTS = [50, 100, 300];

export function DonateButton() {
  const { purchase } = useTelegramPayments();

  const handleDonate = (amount: number) => {
    const userId = (window.Telegram?.WebApp as any)?.initDataUnsafe?.user?.id;
    if (!userId) {
      alert('Не удалось определить пользователя.');
      return;
    }
    purchase(userId.toString(), `donate_${amount}`);
  };

  return (
    <div className="donate-section">
      <p className="donate-section__title">❤️ Поддержать проект</p>
      <p className="donate-section__subtitle">
        Ваша поддержка помогает развивать приложение
      </p>
      <div className="donate-buttons">
        {DONATE_AMOUNTS.map((amount) => (
          <button
            key={amount}
            className="donate-button"
            onClick={() => handleDonate(amount)}
          >
            <span className="donate-button__stars">⭐</span>
            <span className="donate-button__amount">{amount}</span>
            <span className="donate-button__label">Stars</span>
          </button>
        ))}
      </div>
    </div>
  );
}