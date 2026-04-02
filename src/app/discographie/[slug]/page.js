'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function AlbumPage() {
  const { slug } = useParams();
  const [album, setAlbum] = useState(null);
  const [revues, setRevues] = useState([]);
  const [plateformes, setPlateformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetch(`${STRAPI_URL}/api/albums?filters[slug][$eq]=${slug}&populate[recompenses][populate]=image&populate[revues][populate]=document&populate[artistes][fields]=nom,slug&populate[pochette][fields]=url&populate[galerie][fields]=url&populate[livret][fields]=url`)
      .then(res => res.json())
      .then(data => {
        const a = data.data?.[0];
        setAlbum(a || null);
        setRevues(a?.revues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetch(`${STRAPI_URL}/api/plateformes?populate=logo`)
      .then(res => res.json())
      .then(data => setPlateformes(data.data || []));
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setLightbox(null); setZoom(1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (loading) return (
    <div style={{ padding: '40px', color: 'var(--color-texte-muted)', fontStyle: 'italic' }}>
      Chargement...
    </div>
  );

  if (!album) return (
    <div style={{ padding: '40px', color: 'var(--color-texte-muted)', fontStyle: 'italic' }}>
      Album non trouvé.
    </div>
  );

  const recompenses = album.recompenses || [];
  const galerie = album.galerie || [];

  const liensPlateformes = [
    { champ: 'lien_spotify', nom: 'Spotify' },
    { champ: 'lien_deezer', nom: 'Deezer' },
    { champ: 'lien_apple_music', nom: 'Apple Music' },
    { champ: 'lien_youtube_music', nom: 'YouTube Music' },
    { champ: 'lien_amazon', nom: 'Amazon Music' },
    { champ: 'lien_uvm', nom: 'UVM Distribution' },
    { champ: 'lien_discogs', nom: 'Discogs' },
    { champ: 'lien_tidal', nom: 'Tidal' },
    { champ: 'lien_streaming', nom: 'Streaming' },
  ].filter(l => album[l.champ]);

  return (
    <div>
      {lightbox && (
        <div
          onClick={() => { setLightbox(null); setZoom(1); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'pointer',
          }}
        >
          <img
            src={lightbox}
            alt="Photo"
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              imageOrientation: 'from-image',
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s',
              cursor: 'default',
            }}
            onClick={e => e.stopPropagation()}
          />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <button
              onClick={() => setZoom(z => Math.max(1, z - 0.5))}
              style={{
                background: 'transparent',
                border: '0.5px solid #888',
                color: '#888',
                fontSize: '18px',
                padding: '4px 14px',
                cursor: 'pointer',
              }}
            >−</button>
            <button
              onClick={() => setZoom(z => Math.min(4, z + 0.5))}
              style={{
                background: 'transparent',
                border: '0.5px solid #888',
                color: '#888',
                fontSize: '18px',
                padding: '4px 14px',
                cursor: 'pointer',
              }}
            >+</button>
            <button
              onClick={() => { setLightbox(null); setZoom(1); }}
              style={{
                background: 'transparent',
                border: '0.5px solid #888',
                color: '#888',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '4px 14px',
                cursor: 'pointer',
              }}
            >Fermer</button>
          </div>
        </div>
      )}

      <div style={{
        padding: '40px 40px 32px',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <a href="/discographie" style={{
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-texte-muted)',
          fontWeight: '300',
          display: 'inline-block',
          marginBottom: '20px',
        }}>← Discographie</a>
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
        }}>{album.titre}</h1>
      </div>

      <div className="album-grid" style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <div className="album-sidebar" style={{
          padding: '32px 28px',
          borderRight: '0.5px solid var(--color-bordure)',
        }}>
          <div
  onClick={() => album.pochette && setLightbox(`${STRAPI_URL}${album.pochette.url}`)}
  style={{
    width: '100%',
    background: 'var(--color-bg-alt)',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '0.5px solid var(--color-bordure)',
    cursor: album.pochette ? 'pointer' : 'default',
    overflow: 'hidden',
  }}
>
  {album.pochette ? (
    <img
      src={`${STRAPI_URL}${album.pochette.url}`}
      alt={album.titre}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  ) : (
    <span style={{
      fontFamily: 'var(--font-playfair)',
      fontSize: '16px',
      fontStyle: 'italic',
      color: 'var(--color-texte-muted)',
    }}>{album.titre}</span>
  )}
</div>

          {recompenses.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {recompenses.map(r => (
                <a key={r.id} href={r.lien || '#'} target="_blank" rel="noopener noreferrer" title={r.nom}>
                  {r.image ? (
                    <img src={`${STRAPI_URL}${r.image.url}`} alt={r.nom} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-or)' }}>{r.nom}</span>
                  )}
                </a>
              ))}
            </div>
          )}

          {liensPlateformes.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-texte-muted)',
                marginBottom: '10px',
              }}>Écouter et acheter</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {liensPlateformes.map(function(item) {
                  const plateforme = plateformes.find(function(p) { return p.nom === item.nom; });
                  const lienUrl = album[item.champ] || '#';
                  return (
                    <a
                      key={item.champ}
                      href={lienUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.nom}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        border: '0.5px solid var(--color-bordure)',
                        borderRadius: '4px',
                        background: 'var(--color-bg-alt)',
                        overflow: 'hidden',
                      }}
                    >
                      {plateforme && plateforme.logo ? (
                        <img
                          src={STRAPI_URL + plateforme.logo.url}
                          alt={item.nom}
                          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '9px', color: 'var(--color-texte-muted)', textAlign: 'center', padding: '2px' }}>{item.nom}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {album.livret && (
            <a
              href={STRAPI_URL + album.livret.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '8px 14px',
                border: '0.5px solid var(--color-accent)',
                color: 'var(--color-accent)',
                fontWeight: '300',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >Livret (PDF)</a>
          )}

          <div style={{ fontSize: '13px', fontWeight: '300', lineHeight: '1.8' }}>
            {album.artistes?.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-texte-muted)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Artistes</span>
                <p style={{ color: 'var(--color-texte)' }}>{album.artistes.map(a => a.nom).join(', ')}</p>
              </div>
            )}
            {album.date_sortie && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-texte-muted)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Sortie</span>
                <p style={{ color: 'var(--color-texte)' }}>
                  {new Date(album.date_sortie).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
            {album.reference && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-texte-muted)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Référence</span>
                <p style={{ color: 'var(--color-texte)' }}>{album.reference}</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '32px 36px' }}>
          {album.notes_programme && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '16px',
                fontWeight: '300',
              }}>Notes de programme</p>
              <div style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--color-texte-secondaire)', fontWeight: '300' }}>
                {typeof album.notes_programme === 'string'
                  ? album.notes_programme
                  : album.notes_programme.map((block, i) => (
                    <p key={i} style={{ marginBottom: '16px' }}>
                      {block.children?.map(child => child.text).join('')}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {galerie.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '16px',
                fontWeight: '300',
              }}>Autour de l'album</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {galerie.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setLightbox(STRAPI_URL + photo.url)}
                    style={{ cursor: 'pointer', overflow: 'hidden', border: '0.5px solid var(--color-bordure)' }}
                  >
                    <img
                      src={STRAPI_URL + photo.url}
                      alt={'Photo ' + (i + 1)}
                      style={{ width: '100%', height: 'auto', display: 'block', imageOrientation: 'from-image' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {revues.length > 0 && (
            <div>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '8px',
                fontWeight: '300',
                paddingTop: '24px',
                borderTop: '0.5px solid var(--color-bordure-legere)',
              }}>Ce qu'on en dit</p>
              {revues.map(revue => (
                <div key={revue.id} style={{ padding: '12px 0', borderBottom: '0.5px solid var(--color-bordure-legere)' }}>
                  {revue.citation && (
                    <div style={{ borderLeft: '2px solid var(--color-accent)', paddingLeft: '20px', marginBottom: '10px' }}>
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '17px', fontStyle: 'italic', color: 'var(--color-texte)', lineHeight: '1.5' }}>
                        {String.fromCharCode(171)} {revue.citation} {String.fromCharCode(187)}
                      </p>
                    </div>
                  )}
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '14px', color: 'var(--color-texte)', marginBottom: '3px' }}>{revue.titre}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-texte-muted)', fontWeight: '300' }}>
                    {revue.publication}{revue.date ? ' · ' + new Date(revue.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
                  </p>
                  {revue.document && (
                    <div onClick={() => setLightbox(STRAPI_URL + revue.document.url)} style={{ cursor: 'pointer', marginTop: '10px', width: '80px' }}>
                      <img
                        src={STRAPI_URL + revue.document.url}
                        alt={revue.titre}
                        style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', border: '0.5px solid var(--color-bordure)', imageOrientation: 'from-image' }}
                      />
                    </div>
                  )}
                  {revue.lien && (
                    <a href={revue.lien} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      borderBottom: '0.5px solid var(--color-accent)',
                      paddingBottom: '1px',
                      fontWeight: '300',
                      marginTop: '8px',
                      display: 'inline-block',
                    }}>Lire l'article</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}