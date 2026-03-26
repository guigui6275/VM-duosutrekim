'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const liens = [
  { href: '/', label: 'Accueil' },
  { href: '/le-duo', label: 'Le duo' },
  { href: '/discographie', label: 'Discographie' },
  { href: '/concerts', label: 'Concerts' },
  { href: '/medias', label: 'Médias' },
  { href: '/presse', label: 'Presse' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: '#1A1A1A',
      height: '56px',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '14px',
          fontWeight: '400',
          letterSpacing: '0.1em',
          color: '#F6F3F0',
        }}>Duo Sutre-Kim</span>
        <div style={{ width: '1px', height: '20px', background: '#444' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: '9px', color: 'var(--color-or)', letterSpacing: '0.18em', fontWeight: '300', fontStyle: 'italic' }}>Violon</span>
          <span style={{ fontSize: '9px', color: '#A898C8', letterSpacing: '0.18em', fontWeight: '300', fontStyle: 'italic' }}>Harpe</span>
        </div>
      </Link>

      <ul style={{ display: 'flex', gap: '22px', listStyle: 'none' }}>
        {liens.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: pathname === href ? 'var(--color-or)' : '#C8C0B8',
              fontWeight: '300',
              borderBottom: pathname === href ? '1px solid var(--color-or)' : 'none',
              paddingBottom: pathname === href ? '1px' : '0',
            }}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}