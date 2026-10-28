'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Markdown from '@/components/Markdown';
import Lightbox from '@/components/Lightbox';


const labelStyle = {
  color: 'var(--color-accent)',
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

const LIENS_PLATEFORMES = [
  { champ: 'lien_spotify', nom: 'Spotify' },
  { champ: 'lien_deezer', nom: 'Deezer' },
  { champ: 'lien_apple_music', nom: 'Apple Music' },
  { champ: 'lien_youtube_music', nom: 'YouTube Music' },
  { champ: 'lien_amazon', nom: 'Amazon' },
  { champ: 'lien_uvm', nom: 'UVM Distribution' },
  { champ: 'lien_discogs', nom: 'Discogs' },
  { champ: 'lien_tidal', nom: 'Tidal' },
];

export default function AlbumDetailSection({ album, revues = [], plateformes = [], isActive = false, onActivate }) {
  const [lightbox, setLightbox] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState('center center');

  const openLightbox = (url) => { setLightbox(url); setZoom(1); setZoomOrigin('center center'); };
  const closeLightbox = () => { setLightbox(null); setZoom(1); };

  const getLogoUrl = (nom) => {
    const p = plateformes.find(p => p.titre === nom);
    return p?.logo?.url ? `${p.logo.url}` : null;
  };

  const recompenses = album.recompenses || [];
  const galerie = album.galerie || [];
  const liensPlateformes = LIENS_PLATEFORMES.filter(l => album[l.champ]);

  const spotifyMatch = album.lien_spotify?.match(/(album|playlist)\/([a-zA-Z0-9]+)/);
  const spotifyEmbedUrl = spotifyMatch
    ? `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`
    : null;

  return (
    <section id={album.slug} style={{ borderBottom: '0.5px solid var(--color-bordure)' }}>
      {lightbox && createPortal(
        <Lightbox
          src={lightbox}
          onClose={closeLightbox}
          zoom={zoom}
          zoomOrigin={zoomOrigin}
          onZoomIn={(origin) => { if (origin) setZoomOrigin(origin); setZoom(z => Math.min(4, z + 0.5)); }}
          onZoomOut={(origin) => { if (origin) setZoomOrigin(origin); setZoom(z => Math.max(1, z - 0.5)); }}
        />,
        document.body
      )}

      <div style={{ padding: '32px 40px 12px' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '400' }}>{album.titre}</h2>
        {album.date_sortie && (
          <p style={{ fontSize: '12px', color: 'var(--color-texte-muted)', fontWeight: '300', marginTop: '4px' }}>
            {new Date(album.date_sortie).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      <div className="album-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr' }}>

        {/* Colonne gauche */}
        <div className="album-sidebar" style={{ padding: '24px 28px', borderRight: '0.5px solid var(--color-bordure)' }}>

          <div
            onClick={() => album.pochette && openLightbox(`${album.pochette.url}`)}
            style={{ width: '100%', marginBottom: '8px', border: '0.5px solid var(--color-bordure)', cursor: album.pochette ? 'pointer' : 'default', overflow: 'hidden' }}
          >
            {album.pochette ? (
              <img src={`${album.pochette.url}`} alt={album.titre} style={{ width: '100%', height: 'auto', display: 'block' }} />
            ) : (
              <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-alt)' }}>
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', fontStyle: 'italic', color: 'var(--color-texte-muted)' }}>{album.titre}</span>
              </div>
            )}
          </div>

          {recompenses.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              {recompenses.map(r => (
                <a key={r.id} href={r.lien || '#'} target="_blank" rel="noopener noreferrer" title={r.nom}>
                  {r.image
                    ? <img src={`${r.image.url}`} alt={r.nom} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '12px', color: 'var(--color-or)' }}>{r.nom}</span>}
                </a>
              ))}
            </div>
          )}

          {liensPlateformes.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ ...labelStyle, marginBottom: '10px', fontWeight: '300' }}>Écouter et acheter</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {liensPlateformes.map(item => {
                  const logoUrl = getLogoUrl(item.nom);
                  return (
                    <a key={item.champ} href={album[item.champ]} target="_blank" rel="noopener noreferrer" title={item.nom}>
                      {logoUrl
                        ? <img src={logoUrl} alt={item.nom} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                        : <span style={{ fontSize: '10px', color: 'var(--color-or)' }}>{item.nom}</span>}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {album.lien_calameo && (
            <div
              onClick={() => openLightbox(`calameo:${album.lien_calameo}`)}
              style={{ cursor: 'pointer', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px', border: '0.5px solid var(--color-accent)', color: 'var(--color-accent)', fontWeight: '300', textAlign: 'center', marginBottom: '16px' }}
            >
              Livret (PDF)
            </div>
          )}

          <div style={{ fontSize: '13px', fontWeight: '300', lineHeight: '1.8' }}>
            {album.artistes?.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <span style={labelStyle}>Artistes</span>
                <p style={{ color: 'var(--color-texte)' }}>{album.artistes.map(a => a.nom).join(', ')}</p>
              </div>
            )}
            {album.reference && (
              <div style={{ marginBottom: '8px' }}>
                <span style={labelStyle}>Référence</span>
                <p style={{ color: 'var(--color-texte)' }}>{album.reference}</p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{ padding: '24px 36px' }}>

          {spotifyEmbedUrl && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{ ...labelStyle, marginBottom: '16px', fontWeight: '300' }}>Extraits</p>
              {isActive ? (
                <iframe
                  src={`${spotifyEmbedUrl}?utm_source=generator&theme=0&autoplay=1`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  style={{ borderRadius: '12px', display: 'block' }}
                  title={album.titre}
                />
              ) : (
                <button
                  onClick={onActivate}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'transparent',
                    border: '0.5px solid var(--color-bordure)',
                    color: 'var(--color-texte-secondaire)',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-accent)">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  Écouter sur Spotify
                </button>
              )}
            </div>
          )}

          {album.notes_programme && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{ ...labelStyle, marginBottom: '16px', fontWeight: '300' }}>Notes de programme</p>
              <div style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--color-texte-secondaire)', fontWeight: '300' }}>
                {typeof album.notes_programme === 'string'
                  ? <Markdown>{album.notes_programme}</Markdown>
                  : album.notes_programme.map((block, i) => (
                    <Markdown key={i} style={{ marginBottom: '16px' }}>
                      {block.children?.map(c => c.text).join('')}
                    </Markdown>
                  ))}
              </div>
            </div>
          )}

          {galerie.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{ ...labelStyle, marginBottom: '16px', fontWeight: '300' }}>Autour de l'album</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {galerie.map((photo, i) => (
                  <div key={i} onClick={() => openLightbox(`${photo.url}`)} style={{ cursor: 'pointer', overflow: 'hidden', border: '0.5px solid var(--color-bordure)' }}>
                    <img src={`${photo.url}`} alt={`Photo ${i + 1}`} style={{ width: '100%', height: 'auto', display: 'block', imageOrientation: 'from-image' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {revues.length > 0 && (
            <div>
              <p style={{ ...labelStyle, marginBottom: '8px', fontWeight: '300', paddingTop: '24px', borderTop: '0.5px solid var(--color-bordure-legere)' }}>Ce qu'on en dit</p>
              {revues.map(revue => (
                <div
                  key={revue.id}
                  onClick={() => revue.document && openLightbox(`${revue.document.url}`)}
                  style={{ padding: '12px 0', borderBottom: '0.5px solid var(--color-bordure-legere)', cursor: revue.document ? 'pointer' : 'default' }}
                >
                  {revue.citation && (
                    <div style={{ borderLeft: '2px solid var(--color-accent)', paddingLeft: '20px', marginBottom: '10px' }}>
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '17px', fontStyle: 'italic', color: 'var(--color-texte)', lineHeight: '1.5' }}>« {revue.citation} »</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '14px', color: 'var(--color-texte)', marginBottom: '3px' }}>{revue.titre}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-texte-muted)', fontWeight: '300' }}>
                        {revue.publication}{revue.date ? ' · ' + new Date(revue.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
                      </p>
                    </div>
                    {revue.document && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0, marginLeft: '12px' }}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    )}
                  </div>
                  {revue.lien && (
                    <a href={revue.lien} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)', borderBottom: '0.5px solid var(--color-accent)', paddingBottom: '1px', fontWeight: '300', marginTop: '8px', display: 'inline-block' }}>
                      Lire l'article
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
