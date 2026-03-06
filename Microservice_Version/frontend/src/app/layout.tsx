import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Monolith E-Commerce',
  description: 'Phase 0 Baseline',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">Monolith Shop</Link>
          <div className="flex gap-4">
            <Link href="/cart">Cart</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        </nav>
        <main className="p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
