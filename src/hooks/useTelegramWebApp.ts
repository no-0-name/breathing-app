import { useCallback, useEffect, useMemo } from 'react';
import type { TelegramThemeParams } from '../types/telegram';

/**
 * Maps Telegram's theme params onto our own CSS custom properties, so the
 * app blends into whatever theme (light/dark, custom client colors) the
 * user has set in Telegram — instead of always looking like a fixed design.
 * Falls back silently to the CSS defaults in global.css when a value is
 * missing (e.g. when running outside Telegram).
 */
function applyTelegramTheme(theme: TelegramThemeParams): void {
  const root = document.documentElement.style;
  if (theme.bg_color) root.setProperty('--color-bg', theme.bg_color);
  if (theme.secondary_bg_color) root.setProperty('--color-surface', theme.secondary_bg_color);
  if (theme.text_color) root.setProperty('--color-text-primary', theme.text_color);
  if (theme.hint_color) root.setProperty('--color-text-secondary', theme.hint_color);
  if (theme.button_color) root.setProperty('--color-accent', theme.button_color);
}

/**
 * Encapsulates every interaction with the Telegram WebApp bridge.
 * Components never talk to `window.Telegram` directly — they use this hook
 * instead, so swapping or mocking the bridge only touches one place (DRY,
 * Dependency Inversion).
 *
 * Every returned function is wrapped in useCallback so its identity stays
 * stable across renders. Without this, consumers that put these functions
 * in a useEffect dependency array (e.g. to register a back-button handler)
 * would have that effect re-run on every render — the same class of bug
 * that previously broke the breathing session timer.
 */
export function useTelegramWebApp() {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  useEffect(() => {
    if (!webApp) return;
    webApp.ready();
    webApp.expand();
    applyTelegramTheme(webApp.themeParams);
  }, [webApp]);

  const hapticSelection = useCallback(() => webApp?.HapticFeedback.selectionChanged(), [webApp]);

  const hapticImpact = useCallback(
    (style: 'light' | 'medium' | 'heavy' = 'light') => webApp?.HapticFeedback.impactOccurred(style),
    [webApp],
  );

  const hapticSuccess = useCallback(() => webApp?.HapticFeedback.notificationOccurred('success'), [webApp]);

  const setBackButton = useCallback(
    (visible: boolean, onClick?: () => void) => {
      if (!webApp) return;
      if (visible) {
        webApp.BackButton.show();
        if (onClick) webApp.BackButton.onClick(onClick);
      } else {
        webApp.BackButton.hide();
        if (onClick) webApp.BackButton.offClick(onClick);
      }
    },
    [webApp],
  );

  return {
    isAvailable: Boolean(webApp),
    colorScheme: webApp?.colorScheme ?? 'dark',
    hapticSelection,
    hapticImpact,
    hapticSuccess,
    setBackButton,
  };
}
