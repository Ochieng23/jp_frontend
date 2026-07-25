import './globals.css';
import AuthProvider from '../components/AuthProvider';

export const metadata = {
  title: 'Cazini — Portable Employment Credentials',
  description:
    'A portable cross-jurisdiction employment credential system for refugees and mobile workers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
