export default function Input({ label, name, type = 'text', value, onChange, required = false, placeholder, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label htmlFor={name} style={{ fontWeight: 500, fontSize: '0.9rem' }}>
          {label}
          {required && <span style={{ color: 'var(--color-error)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={{
          padding: '0.5rem 0.75rem',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius)',
          fontSize: '0.95rem',
          outline: 'none',
          width: '100%',
        }}
      />
      {error && <span style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>{error}</span>}
    </div>
  );
}
