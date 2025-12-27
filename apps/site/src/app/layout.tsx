import { ReactNode } from 'react';
import './global.css';

export const metadata = {
  title: 'Base Ripple',
  description:
    'Framework-agnostic, customizable, high-performance ripple interaction.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
