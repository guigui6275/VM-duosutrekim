import { getArtiste } from '@/lib/api';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const metadata = {
  title: 'Contact — Guillaume Sutre',
};

export default async function ContactPage() {
  const artiste = await getArtiste(SLUG);
  const a = artiste.data[0];

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
        }}>{a?.nom}</p>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '32px',
          fontWeight: '400',
          marginBottom: '8px',
        }}>Contact</h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--color-texte-secondaire)',
          fontWeight: '300',
        }}>Pour toute demande de concert, interview ou information.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
      }}>
        <div style={{
          padding: '36px 36px 36px 40px',
          borderRight: '0.5px solid var(--color-bordure)',
        }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '20px',
            fontWeight: '300',
          }}>Nous écrire</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '18px',
          }}>
            {['Prénom', 'Nom'].map(label => (
              <div key={label}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-texte-muted)',
                  marginBottom: '6px',
                  fontWeight: '300',
                }}>{label}</label>
                <input type="text" style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid var(--color-bordure)',
                  background: 'var(--color-bg)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  color: 'var(--color-texte)',
                  fontWeight: '300',
                  boxSizing: 'border-box',
                  outline: 'none',
                }} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '6px',
              fontWeight: '300',
            }}>Email</label>
            <input type="email" style={{
              width: '100%',
              padding: '10px 12px',
              border: '0.5px solid var(--color-bordure)',
              background: 'var(--color-bg)',
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              color: 'var(--color-texte)',
              fontWeight: '300',
              boxSizing: 'border-box',
              outline: 'none',
            }} />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '6px',
              fontWeight: '300',
            }}>Sujet</label>
            <select style={{
              width: '100%',
              padding: '10px 12px',
              border: '0.5px solid var(--color-bordure)',
              background: 'var(--color-bg)',
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              color: 'var(--color-texte)',
              fontWeight: '300',
              boxSizing: 'border-box',
              outline: 'none',
              appearance: 'none',
            }}>
              <option>Demande de concert</option>
              <option>Interview / presse</option>
              <option>Renseignement général</option>
              <option>Autre</option>
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '6px',
              fontWeight: '300',
            }}>Message</label>
            <textarea rows={5} style={{
              width: '100%',
              padding: '10px 12px',
              border: '0.5px solid var(--color-bordure)',
              background: 'var(--color-bg)',
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              color: 'var(--color-texte)',
              fontWeight: '300',
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'vertical',
            }} />
          </div>

          <button style={{
            padding: '12px 28px',
            background: 'var(--color-noir)',
            color: '#F8F4EF',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-serif)',
            border: 'none',
            fontWeight: '300',
            cursor: 'pointer',
          }}>Envoyer</button>
        </div>

        <div style={{ padding: '36px 28px' }}>
          {a?.email && (
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
              }}>Email</p>
              <a href={`mailto:${a.email}`} style={{
                fontSize: '13px',
                color: 'var(--color-or)',
                fontWeight: '300',
                borderBottom: '0.5px solid var(--color-or)',
              }}>{a.email}</a>
            </div>
          )}

          {a?.site_web && (
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

          {a?.facebook && (
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
              }}>Facebook</p>
              <a href={a.facebook} style={{
                fontSize: '13px',
                color: 'var(--color-or)',
                fontWeight: '300',
                borderBottom: '0.5px solid var(--color-or)',
              }}>Page Facebook</a>
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
            }}>Sonarti Records</p>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-texte-secondaire)',
              lineHeight: '1.6',
              fontWeight: '300',
              marginBottom: '10px',
            }}>Pour les demandes de booking et de presse concernant le label.</p>
            <a href="https://sonarti.com/contact" style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              borderBottom: '0.5px solid var(--color-accent)',
              paddingBottom: '1px',
              fontWeight: '300',
            }}>Contact label</a>
          </div>
        </div>
      </div>
    </div>
  );
}