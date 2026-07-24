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

export function ScreenHeader({ title, onGoHome, rightElement }: ScreenHeaderProps) {
  return (
    <div className="screen-header">
      <div className="screen-header__left">
        <IconButton aria-label="На главный экран" onClick={onGoHome}>
          <HomeIcon />
        </IconButton>
      </div>
      <h1 className="screen-header__title">{title}</h1>
      <div className="screen-header__right">
        {rightElement || <div className="screen-header__spacer" aria-hidden="true" />}
      </div>
    </div>
  );
}