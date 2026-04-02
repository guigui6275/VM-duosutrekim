'use client';
import { useState } from 'react';

export default function GaleriePresse({ documents, strapiUrl }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
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
            alt="Document"
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: '0.5px solid #888',
              color: '#888',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >Fermer</button>
        </div>
      )}

      <div className="apropos-documents" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        {documents.map(revue => (
          <div
            key={revue.id}
            onClick={() => setLightbox(`${strapiUrl}${revue.document.url}`)}
            style={{
              cursor: 'pointer',
              border: '0.5px solid var(--color-bordure)',
              overflow: 'hidden',
            }}
          >
            <img
              src={`${strapiUrl}${revue.document.url}`}
              alt={revue.titre}
              style={{
                width: '100%',
                aspectRatio: '3/4',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div style={{ padding: '8px 10px' }}>
              <p style={{
                fontSize: '11px',
                color: 'var(--color-texte)',
                fontWeight: '300',
                marginBottom: '2px',
              }}>{revue.publication}</p>
              <p style={{
                fontSize: '10px',
                color: 'var(--color-texte-muted)',
                fontWeight: '300',
              }}>
                {revue.date ? new Date(revue.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
