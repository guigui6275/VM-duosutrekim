'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const liens = [
  { href: '/le-duo', label: 'Le Duo' },
  { href: '/discographie', label: 'Discographie' },
  { href: '/calendrier', label: 'Calendrier' },
  { href: '/medias', label: 'Médias' },
  { href: '/presse', label: 'presse' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOuvert(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOuvert(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav ref={navRef} style={{
      background: '#1A1A1A',
      position: 'relative',
      zIndex: 100,
      borderBottom: '0.5px solid var(--color-bordure)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '56px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setMenuOuvert(false)}>
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

        <ul style={{
          display: 'flex',
          gap: '22px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }} className="nav-desktop">
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

        <button
          onClick={() => setMenuOuvert(!menuOuvert)}
          className="nav-hamburger"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'none',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          <span style={{ display: 'block', width: '22px', height: '1px', background: menuOuvert ? 'var(--color-or)' : '#F6F3F0', transition: 'all .2s', transform: menuOuvert ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: menuOuvert ? 'transparent' : '#F6F3F0', transition: 'all .2s' }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: menuOuvert ? 'var(--color-or)' : '#F6F3F0', transition: 'all .2s', transform: menuOuvert ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </div>

      {menuOuvert && (
        <div style={{
          background: '#1A1A1A',
          borderTop: '0.5px solid var(--color-bordure)',
          padding: '16px 32px 24px',
        }} className="nav-mobile-menu">
          {liens.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOuvert(false)}
              style={{
                display: 'block',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: pathname === href ? 'var(--color-or)' : '#C8C0B8',
                fontWeight: '300',
                padding: '10px 0',
                borderBottom: '0.5px solid var(--color-bordure)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 830px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}