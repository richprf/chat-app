import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen bg-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
