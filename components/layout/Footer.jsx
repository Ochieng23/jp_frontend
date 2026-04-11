export default function Footer() {
  return (
    <footer
      style={{
        textAlign: 'center',
        padding: '1rem 2rem',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-muted)',
        fontSize: '0.85rem',
      }}
    >
      &copy; {new Date().getFullYear()} MyApp. All rights reserved.
    </footer>
  );
}
