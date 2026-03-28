import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      padding: '18px 32px',
      background: '#1A1A1A',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '12px',
        color: 'var(--color-or)',
        letterSpacing: '0.1em',
      }}>
        Duo Sutre-Kim
      </span>

      <span style={{
        fontSize: '11px',
        color: '#6A6A6A',
        fontWeight: '300',
        fontStyle: 'italic',
      }}>
        Artiste Sonarti Records
      </span>

      <div style={{ display: 'flex', gap: '18px' }}>
        <a href="https://www.facebook.com/DuoSutreKim/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#5A5A5A', fontWeight: '300' }}>Facebook</a>
        <Link href="/contact" style={{ fontSize: '11px', color: '#5A5A5A', fontWeight: '300' }}>Contact</Link>
        <a href="https://sonarti.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#5A5A5A', fontWeight: '300' }}>Sonarti Records</a>
        <Link href="/mentions-legales" style={{ fontSize: '11px', color: '#5A5A5A', fontWeight: '300' }}>Mentions légales</Link>
      </div>
    </footer>
  );
}