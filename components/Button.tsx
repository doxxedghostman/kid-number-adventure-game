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

// Glossy 3D button art. Falls back to a flat CSS color for any button color
// that doesn't have generated art yet (currently: pink, yellow).
const BUTTON_ART: Partial<Record<ButtonColor, string>> = {
  green: '/assets/ui/buttons/button-green.png',
  orange: '/assets/ui/buttons/button-orange.png',
  blue: '/assets/ui/buttons/button-blue.png',
  purple: '/assets/ui/buttons/button-purple.png',
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
  const art = BUTTON_ART[color];
  const artStyle: React.CSSProperties = art
    ? {
        backgroundImage: `url(${art})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
      }
    : { backgroundColor: COLORS[color] };

  if (variant === 'square') {
    return (
      <button
        className="square-button wiggle"
        style={artStyle}
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
      style={{ ...artStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {icon}
      {children}
    </button>
  );
}
