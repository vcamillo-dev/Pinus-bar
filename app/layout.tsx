import type { Metadata, Viewport } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import { CarrinhoProvider } from '@/context/CarrinhoContext';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['700', '900'],
});

export const metadata: Metadata = {
  title:       'Pinus Bar — Delivery · Camobi, Santa Maria–RS',
  description: 'Peça agora! Cardápio completo, entrega rápida e pagamento via Pix.',
  keywords:    ['pinus bar', 'delivery', 'camobi', 'santa maria', 'pedir comida'],
  openGraph: {
    title:       'Pinus Bar — Delivery',
    description: 'Cardápio completo com entrega em Camobi e Santa Maria.',
    locale:      'pt_BR',
    type:        'website',
  },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#1B4332',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${playfair.variable}`}>
      <body>
        <CarrinhoProvider>
          {children}
        </CarrinhoProvider>
      </body>
    </html>
  );
}
