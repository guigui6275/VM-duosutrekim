import { getArtiste } from '@/lib/api';
import { getGoogleDoc, GOOGLE_DOCS } from '@/lib/google-doc';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const revalidate = 3600;

export const metadata = {
  title: 'Biographie — Guillaume Sutre',
  description: 'Biographie complète de Guillaume Sutre, violoniste',
};

export default async function BiographiePage() {
  const [artiste, paragraphes] = await Promise.all([
    getArtiste(SLUG),
    getGoogleDoc(GOOGLE_DOCS.biographieCompleteDSK.url, GOOGLE_DOCS.biographieCompleteDSK.options),
  ]);

  const a = artiste.data[0];
  if (!a) return <div style={{ padding: '40px' }}>Artiste non trouvé.</div>;

  const initiales = a.nom.split(/[\s-]/).map(n => n[0]).filter(Boolean).slice(0, 3).join('');

  return (
    <div>

      {/* ── EN-TÊTE ── */}
      <div style={{
        padding: '44px 44px 32px',
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
        }}>Biographie complète</h1>
      </div>

      {/* ── CONTENU ── */}
      <div style={{
        padding: '44px',
      }}>

        {/* Identité */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '36px',
          paddingBottom: '36px',
          borderBottom: '0.5px solid var(--color-bordure-legere)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '1px solid var(--color-accent)',
            background: 'transparent',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-playfair)',
            fontSize: '24px',
            color: 'var(--color-accent)',
          }}>{initiales}</div>
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

        {/* Biographie complète */}
        {paragraphes ? (
          paragraphes.map((paragraphe, i) => (
            <p key={i} style={{
              fontSize: '15px',
              lineHeight: '1.85',
              textAlign: 'justify',
              color: 'var(--color-texte-secondaire)',
              fontWeight: '300',
              marginBottom: '16px',
            }} dangerouslySetInnerHTML={{ __html: paragraphe }} />
          ))
        ) : a.bio_longue ? (
          <div style={{
            fontSize: '15px',
            lineHeight: '1.85',
              textAlign: 'justify',
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
              textAlign: 'justify',
            color: 'var(--color-texte-secondaire)',
            fontWeight: '300',
          }}>{a.bio_courte}</p>
        )}

        {/* Retour */}
        <div style={{
          marginTop: '40px',
          paddingTop: '32px',
          borderTop: '0.5px solid var(--color-bordure-legere)',
        }}>
          <a href="/le-duo" style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            border: '0.5px solid var(--color-accent)',
            padding: '10px 22px',
            fontWeight: '300',
          }}>← Retour</a>
        </div>
      </div>
    </div>
  );
}
