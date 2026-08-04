'use client';

type ButtonColor = 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'yellow';
type ButtonVariant = 'pill' | 'square';

const COLORS: Record<ButtonColor, string> = {
  blue: '#4fc3f7',
  green: '#6bcb77',
  pink: '#ff6fa5',
  purple: '#a66cff',
  orange: '#ff9f45',
  yellow: '#ffd93d',
};

export default function Button({
  children,
  onClick,
  color = 'blue',
  icon,
  variant = 'pill',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: ButtonColor;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
}) {
  if (variant === 'square') {
    return (
      <button
        className="square-button wiggle"
        style={{ backgroundColor: COLORS[color] }}
        onClick={onClick}
        aria-label={typeof children === 'string' ? children : undefined}
      >
        <span className="square-button-icon">{icon}</span>
        <span className="square-button-label">{children}</span>
      </button>
    );
  }

  return (
    <button
      className="big-button wiggle"
      style={{ backgroundColor: COLORS[color], display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {icon}
      {children}
    </button>
  );
}
