// src/App.tsx (updated to handle theme)
import { useEffect, useState } from 'react';
import { BREATHING_TECHNIQUES, getTechniqueById } from './data/techniques';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';
import { useTheme } from './hooks/useTheme';
import { TechniqueList } from './components/TechniqueList/TechniqueList';
import { TechniqueDetail } from './components/TechniqueDetail/TechniqueDetail';
import { SessionScreen } from './components/SessionScreen/SessionScreen';

type Screen =
  | { name: 'list' }
  | { name: 'detail'; techniqueId: string }
  | { name: 'session'; techniqueId: string };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'list' });
  const { setBackButton, hapticSelection } = useTelegramWebApp();
  
  // Initialize theme (this will read from localStorage if available)
  useTheme();

  // Keep Telegram's native back button in sync with our own navigation stack
  useEffect(() => {
    if (screen.name === 'list') {
      setBackButton(false);
      return;
    }

    const goBack = () => {
      setScreen(screen.name === 'session' ? { name: 'detail', techniqueId: screen.techniqueId } : { name: 'list' });
    };

    setBackButton(true, goBack);
    return () => setBackButton(false, goBack);
  }, [screen, setBackButton]);

  const openDetail = (techniqueId: string) => {
    hapticSelection();
    setScreen({ name: 'detail', techniqueId });
  };

  const openSession = () => {
    if (screen.name !== 'detail') return;
    hapticSelection();
    setScreen({ name: 'session', techniqueId: screen.techniqueId });
  };

  const goHome = () => {
    hapticSelection();
    setScreen({ name: 'list' });
  };

  if (screen.name === 'detail') {
    const technique = getTechniqueById(screen.techniqueId);
    if (!technique) return <TechniqueList techniques={BREATHING_TECHNIQUES} onSelectTechnique={openDetail} />;
    return <TechniqueDetail technique={technique} onStart={openSession} onGoHome={goHome} />;
  }

  if (screen.name === 'session') {
    const technique = getTechniqueById(screen.techniqueId);
    if (!technique) return <TechniqueList techniques={BREATHING_TECHNIQUES} onSelectTechnique={openDetail} />;
    return <SessionScreen technique={technique} onGoHome={goHome} />;
  }

  return <TechniqueList techniques={BREATHING_TECHNIQUES} onSelectTechnique={openDetail} />;
}