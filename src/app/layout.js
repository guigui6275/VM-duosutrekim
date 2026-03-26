import { Playfair_Display, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata = {
  title: 'Duo Sutre-Kim — Violon & Harpe',
  description: 'Site officiel du Duo Sutre-Kim, violon et harpe',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${sourceSerif.variable}`}>
      <body>
        <div style={{
          maxWidth: '860px',
          margin: '0 auto',
          border: '0.5px solid var(--color-bordure)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}