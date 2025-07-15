import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './AuthContext';

export const metadata: Metadata = {
  title: 'NPMChat',
  description: 'A neo-brutalist chat app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
