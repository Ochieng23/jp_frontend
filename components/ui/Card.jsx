export default function Card({ title, value, children }) {
  return (
    <div
      style={{
        padding: '1.25rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        background: '#fafafa',
      }}
    >
      {title && <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-muted)' }}>{title}</h3>}
      {value !== undefined && <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</p>}
      {children}
    </div>
  );
}
