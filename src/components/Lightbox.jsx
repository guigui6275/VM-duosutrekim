'use client';
import { useEffect, useRef } from 'react';

const isPdf = (src) => src?.toLowerCase().endsWith('.pdf');
const isCalameo = (src) => src?.startsWith('calameo:');
const getCalameoUrl = (src) => `https://v.calameo.com/?bkcode=${src.replace('calameo:', '')}`;

export default function Lightbox({ src, onClose, zoom, zoomOrigin, onZoomIn, onZoomOut }) {
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleWheel = (e) => {
      if (isPdf(src) || isCalameo(src)) return;
      e.preventDefault();
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const origin = `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`;
      if (e.deltaY < 0) onZoomIn?.(origin);
      else onZoomOut?.(origin);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [src, onClose, onZoomIn, onZoomOut]);

  if (!src) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 9999,
        cursor: 'pointer',
      }}
    >
      {isCalameo(src) ? (
        /* ── Calaméo viewer ── */
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85vw',
            height: '85vh',
            cursor: 'default',
          }}
        >
          <iframe
            src={getCalameoUrl(src)}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            style={{ display: 'block' }}
            title="Livret"
          />
        </div>
      ) : isPdf(src) ? (
        /* ── PDF viewer ── */
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85vw',
            height: '85vh',
            cursor: 'default',
          }}
        >
          <iframe
            src={src}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Document PDF"
          />
        </div>
      ) : (
        /* ── Image viewer ── */
        <img
          ref={imgRef}
          src={src}
          alt="Document"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${zoom || 1})`,
            transformOrigin: zoomOrigin || 'center center',
            maxWidth: '85vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            imageOrientation: 'from-image',
            transition: 'transform 0.15s ease',
            cursor: zoom > 1 ? 'zoom-out' : 'zoom-in',
          }}
        />
      )}

      {/* Boutons */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          background: 'rgba(0,0,0,0.7)',
          padding: '6px 12px',
          borderRadius: '4px',
        }}
      >
        {!isPdf(src) && !isCalameo(src) && <>
          <button
            onClick={(e) => { e.stopPropagation(); onZoomOut?.('center center'); }}
            style={{ background: 'transparent', border: '0.5px solid #aaa', color: '#aaa', fontSize: '18px', padding: '4px 14px', cursor: 'pointer' }}
          >−</button>
          <button
            onClick={(e) => { e.stopPropagation(); onZoomIn?.('center center'); }}
            style={{ background: 'transparent', border: '0.5px solid #aaa', color: '#aaa', fontSize: '18px', padding: '4px 14px', cursor: 'pointer' }}
          >+</button>
        </>}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ background: 'transparent', border: '0.5px solid #aaa', color: '#aaa', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px', cursor: 'pointer' }}
        >Fermer</button>
      </div>
    </div>
  );
}
