// src/components/ScreenHeader/ScreenHeader.tsx
import './ScreenHeader.css';
import { IconButton } from '../IconButton/IconButton';
import { HomeIcon } from '../IconButton/icons';
import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  onGoHome: () => void;
  rightElement?: ReactNode;
}

/**
 * Shared header for every screen except the technique list: a button back
 * to the list, and the screen's title.
 */
export function ScreenHeader({ title, onGoHome, rightElement }: ScreenHeaderProps) {
  return (
    <div className="screen-header">
      <IconButton aria-label="На главный экран" onClick={onGoHome}>
        <HomeIcon />
      </IconButton>
      <h1 className="screen-header__title">{title}</h1>
      <div className="screen-header__right">
        {rightElement || <div className="screen-header__spacer" aria-hidden="true" />}
      </div>
    </div>
  );
}