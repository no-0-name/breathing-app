import { useTelegramPayments } from '../../hooks/useTelegramPayments';
import './PremiumOffer.css';

interface PremiumOfferProps {
  onClose: () => void;
}

export function PremiumOffer({ onClose }: PremiumOfferProps) {
  const { isPremium, loading, purchase } = useTelegramPayments();

  const handleBuy = () => {
    const userId = (window.Telegram?.WebApp as any)?.initDataUnsafe?.user?.id;
    if (!userId) {
      alert('Не удалось определить пользователя.');
      return;
    }
    purchase(userId.toString(), 'premium');
  };

  if (loading) return <div className="premium-offer">Загрузка...</div>;

  if (isPremium) {
    return (
      <div className="premium-offer">
        <div className="premium-offer__content">
          <h2>🌟 У вас уже есть премиум!</h2>
          <p>Спасибо за поддержку.</p>
          <button className="premium-offer__close" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-offer">
      <div className="premium-offer__content">
        <h2>🌟 Премиум-доступ</h2>
        <ul>
          <li>🧘 15+ эксклюзивных техник дыхания</li>
          <li>📊 Расширенная статистика и графики</li>
          <li>🎵 Библиотека звуков природы</li>
          <li>🎨 Тематические оформления</li>
        </ul>
        <p className="premium-offer__price">Всего за 199 Stars ⭐</p>
        <button className="premium-offer__buy" onClick={handleBuy}>
          <span className="buy-btn__icon">⭐</span>
          <span className="buy-btn__text">Купить за 199 Stars</span>
        </button>
        <button className="premium-offer__close" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}