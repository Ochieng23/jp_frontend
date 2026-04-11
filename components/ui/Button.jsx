export default function Button({ children, variant = 'primary', disabled = false, type = 'button', onClick, style }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
    transition: 'background 0.2s',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: { background: 'var(--color-primary)', color: '#fff' },
    secondary: { background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' },
    danger: { background: 'var(--color-error)', color: '#fff' },
  };

  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}
