import { getArtiste, getAlbums, getConcerts, getActualites } from '@/lib/api';
import FacebookWidget from '@/components/FacebookWidget';
import FacebookLikeButton from '@/components/FacebookLikeButton';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export default async function HomePage() {
  const [duo, albums, concerts, actualites] = await Promise.all([
    getArtiste(SLUG),
    getAlbums(SLUG),
    getConcerts(SLUG, true),
    getActualites(SLUG),
  ]);

  const d = duo.data[0];
  const dernierAlbum = albums.data[0];
  const prochainConcert = concerts.data[0];

  if (!d) return <div style={{ padding: '40px' }}>Duo non trouvé.</div>;

  return (
    <div>
      <div style={{
        padding: '52px 40px 44px',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-or)',
          marginBottom: '14px',
          fontWeight: '300',
        }}>Violon & Harpe</p>

        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '44px',
          fontWeight: '400',
          color: 'var(--color-texte)',
          marginBottom: '8px',
          lineHeight: '1.05',
        }}>Duo Sutre-Kim</h1>

        <p style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '18px',
          fontStyle: 'italic',
          color: 'var(--color-accent)',
          marginBottom: '20px',
        }}>Guillaume Sutre & Kyung-Hee Kim-Sutre</p>

        <p style={{
          fontSize: '15px',
          lineHeight: '1.8',
          color: 'var(--color-texte-secondaire)',
          maxWidth: '560px',
          marginBottom: '28px',
          fontWeight: '300',
        }}>{d.bio_courte}</p>

        <div style={{ display: 'flex', gap: '14px' }}>
          <a href="/concerts" style={{
            padding: '10px 22px',
            background: 'var(--color-noir)',
            color: '#F6F3F0',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: '300',
          }}>Prochains concerts</a>
          <a href="/discographie" style={{
            padding: '10px 22px',
            background: 'transparent',
            color: 'var(--color-noir)',
            border: '0.5px solid var(--color-noir)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: '300',
          }}>Discographie</a>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.5px 1fr',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <MembreCard initiales="GS" nom="Guillaume Sutre" instrument="Violon" href="https://guillaume-sutre.com" />
        <div style={{ background: 'var(--color-bordure)' }} />
        <MembreCard initiales="KH" nom="Kyung-Hee Kim-Sutre" instrument="Harpe" href="https://kyung-hee-kim-sutre.com" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.5px 1fr 0.5px 1fr',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <div style={{ padding: '28px 24px' }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '16px',
            fontWeight: '300',
          }}>Dernier album</p>

          {dernierAlbum ? (
            <>
              <div style={{
                width: '100%',
                aspectRatio: '1',
                background: 'var(--color-bg-alt)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '0.5px solid var(--color-bordure)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  color: 'var(--color-texte-muted)',
                }}>{dernierAlbum.titre}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '15px', marginBottom: '3px' }}>
                {dernierAlbum.titre}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-texte-muted)', fontWeight: '300' }}>
                {dernierAlbum.date_sortie
                  ? new Date(dernierAlbum.date_sortie).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : ''}
              </p>
            </>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--color-texte-muted)', fontStyle: 'italic' }}>
              Aucun album pour l'instant
            </p>
          )}
        </div>

        <div style={{ background: 'var(--color-bordure)' }} />

        <div style={{ padding: '28px 24px' }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '16px',
            fontWeight: '300',
          }}>Prochain concert</p>

          {prochainConcert ? (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--color-or)', marginBottom: '3px', fontWeight: '300' }}>
                {new Date(prochainConcert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '14px', marginBottom: '2px' }}>
                {prochainConcert.titre}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-texte-muted)', fontWeight: '300' }}>
                {prochainConcert.lieu} · {prochainConcert.ville}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--color-texte-muted)', fontStyle: 'italic' }}>
              Prochaines dates bientôt
            </p>
          )}
        </div>

        <div style={{ background: 'var(--color-bordure)' }} />

        <div style={{ padding: '28px 24px' }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '16px',
            fontWeight: '300',
          }}>Actualités</p>

          {actualites.data.slice(0, 2).map(actu => (
            <div key={actu.id} style={{
              paddingBottom: '12px',
              marginBottom: '12px',
              borderBottom: '0.5px solid var(--color-bordure-legere)',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--color-or)', marginBottom: '4px', fontWeight: '300' }}>
                {actu.date_publication
                  ? new Date(actu.date_publication).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : ''}
              </p>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '13px', color: 'var(--color-texte)', lineHeight: '1.4' }}>
                {actu.titre}
              </p>
            </div>
          ))}

          {actualites.data.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--color-texte-muted)', fontStyle: 'italic' }}>
              Actualités à venir
            </p>
          )}
        </div>
      </div>

      <div style={{
        padding: '28px 40px',
        background: 'var(--color-bg-alt)',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          marginBottom: '16px',
          fontWeight: '300',
        }}>Répertoire</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}>
          {[
            { periode: 'Baroque', compositeurs: 'Haendel, Telemann' },
            { periode: 'Classique & romantique', compositeurs: 'Mozart, Spohr' },
            { periode: 'Français', compositeurs: 'Debussy, Ravel, Tournier' },
            { periode: 'Contemporain', compositeurs: 'Créations & commandes' },
          ].map(({ periode, compositeurs }) => (
            <div key={periode} style={{
              padding: '14px 16px',
              border: '0.5px solid var(--color-bordure)',
              background: 'var(--color-bg)',
            }}>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.12em',
                color: 'var(--color-or)',
                fontWeight: '300',
                marginBottom: '6px',
              }}>{periode}</p>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '13px',
                color: 'var(--color-texte)',
                lineHeight: '1.5',
                fontStyle: 'italic',
              }}>{compositeurs}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: '32px 40px',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            fontWeight: '300',
          }}>Suivez-nous</p>
          <FacebookLikeButton pageUrl="https://www.facebook.com/DuoSutreKim/" />
        </div>
        <FacebookWidget
          pageUrl="https://www.facebook.com/DuoSutreKim/"
          tabs="timeline"
          height={400}
        />
      </div>
    </div>
  );
}

function MembreCard({ initiales, nom, instrument, href }) {
  return (
    <div style={{
      padding: '28px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: '#1A1A1A',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-playfair)',
        fontSize: '16px',
        color: '#F6F3F0',
      }}>{initiales}</div>
      <div>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', color: 'var(--color-texte)', marginBottom: '3px' }}>
          {nom}
        </p>
        <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--color-accent)', fontWeight: '300', marginBottom: '6px' }}>
          {instrument}
        </p>
        <a href={href} style={{
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-texte-muted)',
          borderBottom: '0.5px solid var(--color-bordure)',
          paddingBottom: '1px',
          fontWeight: '300',
        }}>Site personnel</a>
      </div>
    </div>
  );
}