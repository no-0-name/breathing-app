import './IconButton.css';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'ghost' | 'solid';
  'aria-label': string;
}

/** A round button for icon-only actions. Enforces an aria-label for a11y. */
export function IconButton({ children, variant = 'ghost', className = '', ...rest }: IconButtonProps) {
  return (
    <button className={`icon-button icon-button--${variant} ${className}`} type="button" {...rest}>
      {children}
    </button>
  );
}
