'use client';
import { useState, useEffect } from 'react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG || 'guillaume-sutre';

function ConcertRow({ concert, isPast }) {
  return (
    // className="concert-row" → grid 3 colonnes → 2 colonnes sur mobile (billetterie passe sous l'info)
    <div className="concert-row" style={{
      display: 'grid',
      gridTemplateColumns: '90px 1fr auto',
      gap: '24px',
      alignItems: 'start',
      padding: '20px 0',
      borderBottom: '0.5px solid var(--color-bordure-legere)',
      opacity: isPast ? 0.7 : 1,
    }}>
      <div style={{
        textAlign: 'center',
        background: isPast ? 'var(--color-bg-alt)' : 'var(--color-noir)',
        padding: '10px 8px',
      }}>
        <p style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '28px',
          fontWeight: '400',
          color: isPast ? 'var(--color-texte-muted)' : '#F8F4EF',
          lineHeight: '1',
          marginBottom: '2px',
        }}>
          {new Date(concert.date).toLocaleDateString('fr-FR', { day: 'numeric' })}
        </p>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: isPast ? '#A89880' : 'var(--color-or)',
          fontWeight: '300',
        }}>
          {new Date(concert.date).toLocaleDateString('fr-FR', { month: 'short' })}
        </p>
        <p style={{
          fontSize: '10px',
          color: '#888',
          fontWeight: '300',
          marginTop: '2px',
        }}>
          {new Date(concert.date).getFullYear()}
        </p>
      </div>

      {/* className="concert-info" → prend toute la largeur sur mobile */}
      <div className="concert-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <h3 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '18px',
            fontWeight: '400',
            color: isPast ? 'var(--color-texte-muted)' : 'var(--color-texte)',
          }}>{concert.titre}</h3>
          {concert.type && (
            <span style={{
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              border: `0.5px solid ${concert.type === 'concert' ? 'var(--color-accent)' : concert.type === 'academie' ? 'var(--color-or)' : '#888'}`,
              color: concert.type === 'concert' ? 'var(--color-accent)' : concert.type === 'academie' ? 'var(--color-or)' : '#888',
              fontWeight: '300',
              flexShrink: 0,
            }}>
              {concert.type === 'concert' ? 'Concert' : concert.type === 'academie' ? 'Académie' : 'Masterclasse'}
            </span>
          )}
        </div>

        <p style={{
          fontSize: '13px',
          color: 'var(--color-texte-secondaire)',
          marginBottom: '8px',
          fontWeight: '300',
        }}>{concert.lieu} · {concert.ville}{concert.pays ? `, ${concert.pays}` : ''}</p>

        {concert.programme && (
          <p style={{
            fontSize: '12px',
            color: 'var(--color-texte-muted)',
            fontStyle: 'italic',
            lineHeight: '1.6',
            fontWeight: '300',
          }}>
            {typeof concert.programme === 'string'
              ? concert.programme
              : concert.programme?.[0]?.children?.[0]?.text || ''}
          </p>
        )}

        {/* Billetterie déplacée ici sur mobile via className="concert-billetterie-mobile" */}
        {!isPast && concert.lien_billetterie && (
          <a href={concert.lien_billetterie} target="_blank" rel="noopener noreferrer"
            className="concert-billetterie-mobile"
            style={{
              display: 'none', // masqué par défaut, visible sur mobile via CSS
              marginTop: '12px',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '8px 16px',
              background: 'var(--color-noir)',
              color: '#F8F4EF',
              fontWeight: '300',
              whiteSpace: 'nowrap',
            }}>Billetterie</a>
        )}
      </div>

      {/* className="concert-billetterie-desktop" → masqué sur mobile */}
      <div className="concert-billetterie-desktop" style={{ paddingTop: '4px' }}>
        {!isPast && concert.lien_billetterie ? (
          <a href={concert.lien_billetterie} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '8px 16px',
            background: 'var(--color-noir)',
            color: '#F8F4EF',
            fontWeight: '300',
            whiteSpace: 'nowrap',
          }}>Billetterie</a>
        ) : isPast ? (
          <span style={{
            fontSize: '11px',
            color: '#A89880',
            fontWeight: '300',
            fontStyle: 'italic',
          }}>Passé</span>
        ) : null}
      </div>
    </div>
  );
}

export default function CalendrierPage() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [periode, setPeriode] = useState('avenir');

  useEffect(() => {
    fetch(`${STRAPI_URL}/api/concerts?filters[artistes][slug][$eq]=${SLUG}&populate=*&sort=date:asc`)
      .then(res => res.json())
      .then(data => {
        setConcerts(data.data || []);
        setLoading(false);
      });
  }, []);

  const now = new Date();

  const filtres = [
    { key: 'tous', label: 'Tous' },
    { key: 'concert', label: 'Concerts' },
    { key: 'academie', label: 'Académies' },
    { key: 'masterclasse', label: 'Masterclasses' },
  ];

  const periodes = [
    { key: 'avenir', label: 'À venir' },
    { key: 'passes', label: 'Archives' },
  ];

  const concertsFiltres = concerts.filter(c => {
    const date = new Date(c.date);
    const isPast = date < now;
    if (periode === 'avenir' && isPast) return false;
    if (periode === 'passes' && !isPast) return false;
    if (filtre !== 'tous' && c.type !== filtre) return false;
    return true;
  });

  return (
    <div>
      {/* className="calendrier-header" → padding réduit sur mobile */}
      <div className="calendrier-header" style={{ padding: '40px 40px 0' }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-or)',
          marginBottom: '10px',
          fontWeight: '300',
        }}>Guillaume Sutre</p>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '32px',
          fontWeight: '400',
          marginBottom: '28px',
        }}>Calendrier</h1>
      </div>

      {/* className="calendrier-periodes" → padding réduit sur mobile */}
      <div className="calendrier-periodes" style={{
        display: 'flex',
        gap: '0',
        padding: '0 40px',
        marginBottom: '0',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        {periodes.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriode(p.key)}
            style={{
              fontSize: '12px',
              letterSpacing: '0.08em',
              padding: '10px 20px',
              background: 'transparent',
              color: periode === p.key ? 'var(--color-texte)' : 'var(--color-texte-muted)',
              fontFamily: 'var(--font-serif)',
              fontWeight: '300',
              border: 'none',
              borderBottom: periode === p.key ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-0.5px',
            }}
          >{p.label}</button>
        ))}
      </div>

      {/* className="calendrier-filtres" → padding réduit sur mobile */}
      <div className="calendrier-filtres" style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 40px',
        borderBottom: '0.5px solid var(--color-bordure)',
        flexWrap: 'wrap',
      }}>
        {filtres.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '5px 14px',
              border: '0.5px solid var(--color-bordure)',
              background: filtre === f.key ? 'var(--color-noir)' : 'transparent',
              color: filtre === f.key ? '#F8F4EF' : 'var(--color-texte-muted)',
              fontFamily: 'var(--font-serif)',
              fontWeight: '300',
              cursor: 'pointer',
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* className="calendrier-liste" → padding réduit sur mobile */}
      <div className="calendrier-liste" style={{ padding: '0 40px' }}>
        {loading ? (
          <p style={{ padding: '40px 0', color: 'var(--color-texte-muted)', fontStyle: 'italic', fontWeight: '300' }}>
            Chargement...
          </p>
        ) : concertsFiltres.length > 0 ? (
          concertsFiltres.map(concert => (
            <ConcertRow
              key={concert.id}
              concert={concert}
              isPast={new Date(concert.date) < now}
            />
          ))
        ) : (
          <p style={{ padding: '40px 0', color: 'var(--color-texte-muted)', fontStyle: 'italic', fontWeight: '300' }}>
            Aucun événement dans cette catégorie.
          </p>
        )}
      </div>
    </div>
  );
}