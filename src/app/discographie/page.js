import { getArtiste, getAlbums } from '@/lib/api';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const metadata = {
  title: 'Discographie — Guillaume Sutre',
};

export default async function DiscographiePage() {
  const [artiste, albums] = await Promise.all([
    getArtiste(SLUG),
    getAlbums(SLUG),
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
        }}>Discographie</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
      }}>
        {albums.data.map((album, index) => (
          <div key={album.id} style={{
            borderRight: (index + 1) % 3 !== 0 ? '0.5px solid var(--color-bordure)' : 'none',
            borderBottom: '0.5px solid var(--color-bordure)',
            padding: '28px 24px',
          }}>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              background: 'var(--color-bg-alt)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '0.5px solid var(--color-bordure)',
              position: 'relative',
            }}>
              <span style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '16px',
                fontStyle: 'italic',
                color: 'var(--color-texte-muted)',
              }}>{album.titre}</span>
              <span style={{
                position: 'absolute',
                bottom: '6px',
                right: '8px',
                fontSize: '10px',
                color: '#B8A898',
                fontWeight: '300',
              }}>{album.reference}</span>
            </div>

            <p style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '16px',
              marginBottom: '4px',
            }}>{album.titre}</p>

            <p style={{
              fontSize: '12px',
              color: 'var(--color-accent)',
              marginBottom: '4px',
              fontWeight: '300',
            }}>
              {album.artistes?.map(a => a.nom).join(', ')}
            </p>

            <p style={{
              fontSize: '12px',
              color: 'var(--color-texte-muted)',
              fontWeight: '300',
              marginBottom: '12px',
            }}>
              {album.date_sortie
                ? new Date(album.date_sortie).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                : ''}
            </p>

            {album.notes_programme && (
              <p style={{
                fontSize: '13px',
                color: 'var(--color-texte-secondaire)',
                lineHeight: '1.6',
                fontWeight: '300',
                marginBottom: '14px',
              }}>
                {typeof album.notes_programme === 'string'
                  ? album.notes_programme.slice(0, 100) + '...'
                  : (album.notes_programme?.[0]?.children?.[0]?.text || '').slice(0, 100) + '...'}
              </p>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {album.lien_spotify && (
                <a href={album.lien_spotify} style={{
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  border: '0.5px solid var(--color-or)',
                  color: '#8A6820',
                  fontWeight: '300',
                }}>Spotify</a>
              )}
              {album.lien_streaming && (
                <a href={album.lien_streaming} style={{
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  border: '0.5px solid var(--color-or)',
                  color: '#8A6820',
                  fontWeight: '300',
                }}>Streaming</a>
              )}
            </div>
          </div>
        ))}

        {albums.data.length === 0 && (
          <div style={{ padding: '40px', gridColumn: '1 / -1' }}>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-texte-muted)',
              fontStyle: 'italic',
            }}>Aucun album pour l'instant.</p>
          </div>
        )}
      </div>
    </div>
  );
}