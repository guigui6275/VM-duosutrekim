import { getArtiste, getRevues } from '@/lib/api';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const metadata = {
  title: 'Presse — Guillaume Sutre',
};

export default async function PressePage() {
  const [artiste, revues] = await Promise.all([
    getArtiste(SLUG),
    getRevues(SLUG),
  ]);

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
        }}>Presse</h1>
      </div>

      <div style={{ padding: '0 40px' }}>
        {revues.data.length > 0 ? (
          revues.data.map(revue => (
            <div key={revue.id} style={{
              padding: '28px 0',
              borderBottom: '0.5px solid var(--color-bordure-legere)',
              display: 'grid',
              gridTemplateColumns: '1fr 160px',
              gap: '24px',
              alignItems: 'start',
            }}>
              <div>
                {revue.citation && (
                  <div style={{
                    borderLeft: '2px solid var(--color-accent)',
                    paddingLeft: '20px',
                    marginBottom: '12px',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: '18px',
                      fontStyle: 'italic',
                      color: 'var(--color-texte)',
                      lineHeight: '1.5',
                      marginBottom: '8px',
                    }}>« {revue.citation} »</p>
                  </div>
                )}
                <p style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '15px',
                  color: 'var(--color-texte)',
                  marginBottom: '4px',
                }}>{revue.titre}</p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--color-texte-muted)',
                  fontWeight: '300',
                }}>
                  {revue.publication}
                  {revue.date ? ` · ${new Date(revue.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}` : ''}
                </p>
              </div>

              <div style={{ paddingTop: '4px' }}>
                {revue.lien && (
                  <a href={revue.lien} style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '7px 14px',
                    border: '0.5px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                    fontWeight: '300',
                    marginBottom: '8px',
                    width: '100%',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}>Lire l'article</a>
                )}
                {revue.fichier_pdf && (
                  <a href={revue.fichier_pdf.url} style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '7px 14px',
                    border: '0.5px solid var(--color-bordure)',
                    color: 'var(--color-texte-muted)',
                    fontWeight: '300',
                    width: '100%',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}>PDF</a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{
            fontSize: '14px',
            color: 'var(--color-texte-muted)',
            fontStyle: 'italic',
            padding: '40px 0',
            fontWeight: '300',
          }}>Revues de presse à venir.</p>
        )}
      </div>
    </div>
  );
}