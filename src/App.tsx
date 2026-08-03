import { useEffect, useState } from 'react';
import { BREATHING_TECHNIQUES, getTechniqueById } from './data/techniques';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';
import { useTheme } from './hooks/useTheme';
import { useThemeColor } from './hooks/useThemeColor';
import { TechniqueList } from './components/TechniqueList/TechniqueList';
import { TechniqueDetail } from './components/TechniqueDetail/TechniqueDetail';
import { SessionScreen } from './components/SessionScreen/SessionScreen';
import { ProfileScreen } from './components/ProfileScreen/ProfileScreen';

type Screen =
  | { name: 'list' }
  | { name: 'detail'; techniqueId: string }
  | { name: 'session'; techniqueId: string }
  | { name: 'profile' };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'list' });
  const { setBackButton, hapticSelection } = useTelegramWebApp();

  useTheme();
  useThemeColor();

  useEffect(() => {
    if (screen.name === 'list') {
      setBackButton(false);
      return;
    }

    const goBack = () => {
      if (screen.name === 'session') {
        setScreen({ name: 'detail', techniqueId: screen.techniqueId });
      } else if (screen.name === 'detail') {
        setScreen({ name: 'list' });
      } else if (screen.name === 'profile') {
        setScreen({ name: 'list' });
      } else {
        setScreen({ name: 'list' });
      }
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

  const goToProfile = () => {
    hapticSelection();
    setScreen({ name: 'profile' });
  };

  if (screen.name === 'profile') {
    return <ProfileScreen onGoHome={goHome} />;
  }

  if (screen.name === 'detail') {
    const technique = getTechniqueById(screen.techniqueId);
    if (!technique) {
      return (
        <TechniqueList
          techniques={BREATHING_TECHNIQUES}
          onSelectTechnique={openDetail}
          onNavigateToProfile={goToProfile}
        />
      );
    }
    return <TechniqueDetail technique={technique} onStart={openSession} onGoHome={goHome} />;
  }

  if (screen.name === 'session') {
    const technique = getTechniqueById(screen.techniqueId);
    if (!technique) {
      return (
        <TechniqueList
          techniques={BREATHING_TECHNIQUES}
          onSelectTechnique={openDetail}
          onNavigateToProfile={goToProfile}
        />
      );
    }
    return <SessionScreen technique={technique} onGoHome={goHome} />;
  }

  return (
    <TechniqueList
      techniques={BREATHING_TECHNIQUES}
      onSelectTechnique={openDetail}
      onNavigateToProfile={goToProfile}
    />
  );
}