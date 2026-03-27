import { getArtiste } from '@/lib/api';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const metadata = {
  title: 'Biographie — Guillaume Sutre',
};

export default async function BiographiePage() {
  const artiste = await getArtiste(SLUG);
  const a = artiste.data[0];

  if (!a) return <div style={{ padding: '40px' }}>Artiste non trouvé.</div>;

  return (
    <div>
      <div style={{
        padding: '40px 40px 32px',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
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
        }}>Biographie</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 240px',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <div style={{
          padding: '40px 36px 40px 40px',
          borderRight: '0.5px solid var(--color-bordure)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '0.5px solid var(--color-bordure-legere)',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--color-noir)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-playfair)',
              fontSize: '24px',
              color: '#F8F4EF',
            }}>GS</div>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '24px',
                fontWeight: '400',
                marginBottom: '4px',
              }}>{a.nom}</h2>
              <p style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: 'var(--color-accent)',
                fontWeight: '300',
              }}>{a.instrument}</p>
            </div>
          </div>

          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '16px',
            fontWeight: '300',
          }}>Biographie</p>

          {a.bio_longue ? (
            <div style={{
              fontSize: '15px',
              lineHeight: '1.85',
              color: 'var(--color-texte-secondaire)',
              fontWeight: '300',
            }}>
              {typeof a.bio_longue === 'string'
                ? a.bio_longue
                : a.bio_longue.map((block, i) => (
                  <p key={i} style={{ marginBottom: '16px' }}>
                    {block.children?.map(child => child.text).join('')}
                  </p>
                ))}
            </div>
          ) : (
            <p style={{
              fontSize: '15px',
              lineHeight: '1.85',
              color: 'var(--color-texte-secondaire)',
              fontWeight: '300',
            }}>{a.bio_courte}</p>
          )}
        </div>

        <div style={{ padding: '40px 28px' }}>
          {a.site_web && (
            <div style={{
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '0.5px solid var(--color-bordure-legere)',
            }}>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '10px',
                fontWeight: '300',
              }}>Site web</p>
              <a href={a.site_web} style={{
                fontSize: '13px',
                color: 'var(--color-or)',
                fontWeight: '300',
                borderBottom: '0.5px solid var(--color-or)',
              }}>{a.site_web}</a>
            </div>
          )}

          {a.email && (
            <div style={{
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '0.5px solid var(--color-bordure-legere)',
            }}>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '10px',
                fontWeight: '300',
              }}>Contact</p>
              <a href={`mailto:${a.email}`} style={{
                fontSize: '13px',
                color: 'var(--color-or)',
                fontWeight: '300',
                borderBottom: '0.5px solid var(--color-or)',
              }}>{a.email}</a>
            </div>
          )}

          <div style={{
            background: 'var(--color-bg-alt)',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '10px',
              fontWeight: '300',
            }}>Biographie courte</p>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-texte-secondaire)',
              lineHeight: '1.6',
              fontWeight: '300',
              marginBottom: '12px',
            }}>{a.bio_courte}</p>
            <button style={{
              display: 'block',
              width: '100%',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              border: '0.5px solid var(--color-accent)',
              padding: '7px 14px',
              background: 'transparent',
              fontFamily: 'var(--font-serif)',
              fontWeight: '300',
            }}>Télécharger (PDF)</button>
          </div>
        </div>
      </div>
    </div>
  );
}