import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CarbonX — Captured Carbon. Matched to Opportunity.',
  description:
    'B2B Carbon Capture-to-Utilization Marketplace connecting industrial CO₂ suppliers with utilization demand through intelligent matching and logistics estimation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#0B1220]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
