import { useThemeColor } from '../../hooks/useThemeColor';
import { IconButton } from '../IconButton/IconButton';
import { ColorIcon } from '../IconButton/icons';
import './ThemeCustomizer.css';

export function ThemeCustomizer() {
  const { colors, accentColor, setAccentColor } = useThemeColor();

  return (
    <div className="theme-customizer">
      <div className="theme-customizer__header">
        <IconButton variant="ghost" aria-label="Выбор цвета">
          <ColorIcon />
        </IconButton>
        <span className="theme-customizer__label">Акцентный цвет</span>
      </div>
      <div className="theme-customizer__grid">
        {colors.map((color) => (
          <button
            key={color.value}
            className={`theme-customizer__item ${accentColor === color.value ? 'theme-customizer__item--active' : ''}`}
            style={{ backgroundColor: color.value }}
            onClick={() => setAccentColor(color.value)}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
}