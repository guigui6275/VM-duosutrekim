import { getConcerts } from '@/lib/api';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const metadata = {
  title: 'Concerts — Guillaume Sutre',
};

function ConcertRow({ concert, isPast }) {
  return (
    <div style={{
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

      <div>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '18px',
          fontWeight: '400',
          color: isPast ? 'var(--color-texte-muted)' : 'var(--color-texte)',
          marginBottom: '6px',
        }}>{concert.titre}</h3>

        <p style={{
          fontSize: '13px',
          color: 'var(--color-texte-secondaire)',
          marginBottom: '8px',
          fontWeight: '300',
        }}>{concert.lieu} · {concert.ville}, {concert.pays}</p>

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
      </div>

      <div style={{ paddingTop: '4px' }}>
        {!isPast && concert.lien_billetterie ? (
          <a href={concert.lien_billetterie} style={{
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
          }}>Concert passé</span>
        ) : null}
      </div>
    </div>
  );
}

export default async function ConcertsPage() {
  const [aVenir, passes] = await Promise.all([
    getConcerts(SLUG, true),
    getConcerts(SLUG, false),
  ]);

  return (
    <div>
      <div style={{ padding: '40px 40px 0' }}>
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
        }}>Concerts</h1>
      </div>

      <div style={{ padding: '0 40px' }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          fontWeight: '300',
          padding: '24px 0 0',
        }}>À venir</p>

        {aVenir.data.length > 0 ? (
          aVenir.data.map(concert => (
            <ConcertRow key={concert.id} concert={concert} isPast={false} />
          ))
        ) : (
          <p style={{
            fontSize: '14px',
            color: 'var(--color-texte-muted)',
            fontStyle: 'italic',
            padding: '20px 0',
            fontWeight: '300',
          }}>Prochaines dates annoncées bientôt.</p>
        )}
      </div>

      {passes.data.length > 0 && (
        <div style={{
          borderTop: '0.5px solid var(--color-bordure)',
          padding: '0 40px',
          marginTop: '8px',
        }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-texte-muted)',
            fontWeight: '300',
            padding: '24px 0 0',
          }}>Archives</p>

          {passes.data.map(concert => (
            <ConcertRow key={concert.id} concert={concert} isPast={true} />
          ))}
        </div>
      )}
    </div>
  );
}