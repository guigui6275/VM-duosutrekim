import { getArtiste } from '@/lib/api';
import { getGoogleDoc, GOOGLE_DOCS } from '@/lib/google-doc';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const metadata = {
  title: 'Le duo — Duo Sutre-Kim',
  description: 'Biographie complète du Duo Sutre-Kim',
};

export default async function BiographiePage() {
  const [artiste, paragraphes] = await Promise.all([
    getArtiste(SLUG),
    getGoogleDoc(GOOGLE_DOCS.biographieCourteDSK.url, GOOGLE_DOCS.biographieCourteDSK.options)
  ]);

  const a = artiste.data[0];
  if (!a) return <div style={{ padding: '40px' }}>Artiste non trouvé.</div>;

  return (
    <div>
      <div className="apropos-header" style={{
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
        }}>Duo Sutre-Kim</p>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '32px',
          fontWeight: '400',
        }}>Le duo</h1>
      </div>

      <div className="apropos-layout" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 240px',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <div className="apropos-main" style={{
          padding: '40px 36px 40px 40px',
          borderRight: '0.5px solid var(--color-bordure)',
        }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '16px',
            fontWeight: '300',
          }}>Notre histoire</p>

          {/* Biographie depuis Google Doc, fallback Strapi */}
          {paragraphes ? (
            <div style={{ marginBottom: '24px' }}>
              {paragraphes.map((paragraphe, i) => (
                <p key={i} style={{
                  fontSize: '15px',
                  lineHeight: '1.85',
                  color: 'var(--color-texte-secondaire)',
                  fontWeight: '300',
                  marginBottom: '16px',
                  textAlign: 'justify',
                }} dangerouslySetInnerHTML={{ __html: paragraphe }} />
              ))}
            </div>
          ) : a.bio_longue ? (
            <div style={{
              fontSize: '15px',
              lineHeight: '1.85',
              color: 'var(--color-texte-secondaire)',
              fontWeight: '300',
              marginBottom: '24px',
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
              marginBottom: '24px',
            }}>{a.bio_courte}</p>
          )}
            <a href="/le-duo/bio-complete" style={{
  display: 'inline-block',
  fontSize: '11px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-accent)',
  border: '0.5px solid var(--color-accent)',
  padding: '10px 22px',
  fontWeight: '300',
  marginBottom: '32px',
}}>Lire la biographie complète →</a>
          <div style={{
            borderLeft: '2px solid var(--color-accent)',
            paddingLeft: '20px',
            margin: '32px 0',
          }}>
            <p style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '18px',
              fontStyle: 'italic',
              color: 'var(--color-texte)',
              lineHeight: '1.5',
            }}>
              « La rencontre entre le violon et la harpe est l'une des plus
              intimes qui soit — deux voix qui se répondent, se complètent,
              et ne font plus qu'une. »
            </p>
          </div>

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
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '24px',
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
                background: 'var(--color-bg-alt)',
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

        <div className="apropos-sidebar" style={{ padding: '40px 28px' }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '16px',
            fontWeight: '300',
          }}>Les musiciens</p>

          {[
            { initiales: 'GS', nom: 'Guillaume Sutre', instrument: 'Violon', href: 'https://guillaume-sutre.com' },
            { initiales: 'KHK', nom: 'Kyung-Hee Kim-Sutre', instrument: 'Harpe', href: 'https://kyung-hee-kim-sutre.com' },
          ].map(({ initiales, nom, instrument, href }) => (
            <div key={nom} style={{
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '0.5px solid var(--color-bordure-legere)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--color-noir)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-playfair)',
                fontSize: '14px',
                color: '#F6F3F0',
              }}>{initiales}</div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '14px',
                  color: 'var(--color-texte)',
                  marginBottom: '2px',
                }}>{nom}</p>
                <p style={{
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: 'var(--color-accent)',
                  fontWeight: '300',
                  marginBottom: '6px',
                }}>{instrument}</p>
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
          ))}

          <div style={{
            background: 'var(--color-bg-alt)',
            padding: '20px',
            marginTop: '8px',
          }}>
            <p style={{
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '10px',
              fontWeight: '300',
            }}>Sonarti Records</p>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-texte-secondaire)',
              lineHeight: '1.6',
              fontWeight: '300',
              marginBottom: '10px',
            }}>Le Duo Sutre-Kim est artiste du label Sonarti Records.</p>
            <a href="https://sonarti.com" style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              borderBottom: '0.5px solid var(--color-accent)',
              paddingBottom: '1px',
              fontWeight: '300',
            }}>Visiter le label</a>
          </div>
        </div>
      </div>
    </div>
  );
}