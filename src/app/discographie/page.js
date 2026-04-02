import { getArtiste, getAlbums } from '@/lib/api';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export const metadata = {
  title: 'Discographie — Guillaume Sutre',
};

export default async function DiscographiePage() {
  const [artiste, albumsData, plateformesData] = await Promise.all([
    getArtiste(SLUG),
    getAlbums(SLUG),
    fetch(`${STRAPI_URL}/api/plateformes?populate=logo`).then(r => r.json()),
  ]);

  const a = artiste.data[0];
  const albums = albumsData;
  const plateformes = plateformesData.data || [];

  return (
    <div>
      {/* className="discographie-header" → padding latéral réduit sur mobile */}
      <div className="discographie-header" style={{ padding: '40px 40px 0' }}>
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
          marginBottom: '28px',
        }}>Discographie</h1>
      </div>

      {/* className="discographie-grid" → repeat(2,1fr) → 1 colonne sur mobile */}
      <div className="discographie-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {albums.data.map((album, index) => (
          // className="discographie-card" → padding réduit sur mobile
          // Bug corrigé : % 2 au lieu de % 3 pour une grille 2 colonnes
          <div key={album.id} className="discographie-card" style={{
            borderRight: (index + 1) % 3 !== 0 ? '0.5px solid var(--color-bordure)' : 'none',
            borderBottom: '0.5px solid var(--color-bordure)',
            padding: '28px 24px',
            position: 'relative',
          }}>
            <a href={`/discographie/${album.slug}`} style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
            }}>
              <div style={{
  width: '100%',
  background: 'var(--color-bg-alt)',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '0.5px solid var(--color-bordure)',
  overflow: 'hidden',
}}>
  {album.pochette ? (
    <img
      src={`${STRAPI_URL}${album.pochette.url}`}
      alt={album.titre}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  ) : (
    <div style={{
      aspectRatio: '1',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '16px',
        fontStyle: 'italic',
        color: 'var(--color-texte-muted)',
      }}>{album.titre}</span>
    </div>
  )}
</div>

              {album.recompenses?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {album.recompenses.map(r => (
                    <span key={r.id} title={r.nom}>
                      {r.image ? (
                        <img
                          src={`${STRAPI_URL}${r.image.url}`}
                          alt={r.nom}
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--color-or)' }}>{r.nom}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

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
            </a>
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
