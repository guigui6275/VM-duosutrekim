import { getArtiste } from '@/lib/api';
import { fetchAPI } from '@/lib/api';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const metadata = {
  title: 'Médias — Guillaume Sutre',
};

export default async function MediasPage() {
  const [artiste, videos] = await Promise.all([
    getArtiste(SLUG),
    fetchAPI('/videos', {
      filters: { artistes: { slug: { $eq: SLUG } } },
      populate: '*',
      sort: ['date:desc'],
      pagination: { pageSize: 100 },
      locale: 'fr',
    }),
  ]);

  const a = artiste.data[0];

  return (
    <div>
      {/* className="medias-header" → padding réduit sur mobile */}
      <div className="medias-header" style={{
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
        }}>Médias</h1>
      </div>

      {videos.data.length > 0 ? (
        // className="medias-grid" → repeat(2,1fr) → 1 colonne sur mobile
        <div className="medias-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0',
        }}>
          {videos.data.map((video, index) => (
            // className="medias-card" → padding réduit, border-right effacée sur mobile
            <div key={video.id} className="medias-card" style={{
              borderRight: index % 2 === 0 ? '0.5px solid var(--color-bordure)' : 'none',
              borderBottom: '0.5px solid var(--color-bordure)',
              padding: '24px',
            }}>
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                background: 'var(--color-bg-alt)',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '0.5px solid var(--color-bordure)',
              }}>
                {video.url ? (
                  <iframe
                    src={video.url.replace('watch?v=', 'embed/')}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                ) : (
                  <span style={{
                    fontSize: '13px',
                    color: 'var(--color-texte-muted)',
                    fontStyle: 'italic',
                  }}>Vidéo</span>
                )}
              </div>

              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '15px',
                marginBottom: '4px',
              }}>{video.titre}</p>

              {video.description && (
                <p style={{
                  fontSize: '13px',
                  color: 'var(--color-texte-secondaire)',
                  fontWeight: '300',
                  lineHeight: '1.6',
                  marginBottom: '6px',
                }}>{video.description}</p>
              )}

              {video.date && (
                <p style={{
                  fontSize: '11px',
                  color: 'var(--color-texte-muted)',
                  fontWeight: '300',
                }}>
                  {new Date(video.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '40px' }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-texte-muted)',
            fontStyle: 'italic',
            fontWeight: '300',
          }}>Vidéos à venir.</p>
        </div>
      )}
    </div>
  );
}