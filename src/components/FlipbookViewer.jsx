'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { chargerDocumentPartage } from '@/lib/pdfDocumentCache';

// react-pageflip (StPageFlip) manipule le DOM directement et lit `window` au
// montage → chargé uniquement côté client (ssr:false), jamais rendu côté serveur.
const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false });

// Visionneuse « tourne-page » (flipbook) plein écran, réservée aux LIVRETS de
// disque. Overlay autonome, volontairement distinct du Lightbox utilisé pour la
// presse et les photos (qui gardent le défilement continu via PdfViewer).
//
// Dimensionnement : au premier affichage et à zoom 1, le livret entier tient
// DANS la fenêtre (aucune scrollbar), avec une marge d'au moins 2 cm sur chaque
// côté. Double page (livre ouvert) en mode normal, une seule page en mode
// téléphone.
//
// Zoom : appliqué en `transform: scale` (jamais en changeant la taille réelle),
// pour ne JAMAIS faire apparaître de scrollbar — on se déplace par glissé. On
// ne tourne jamais une page en état zoomé (les flèches dézooment d'abord), donc
// le piège « transform casse la détection souris de StPageFlip » n'est pas un
// problème : au repos (zoom 1) il n'y a aucun transform et le tourne-page
// fonctionne normalement.
const LARGEUR_RENDU_CIBLE = 1400; // px — résolution de rendu de chaque page (nette même zoomée)
const PALIERS_ZOOM = [1, 1.5, 2, 2.75];
const PAD = 76;            // ≈ 2 cm — marge mini imposée autour du livret
const RESERVE_BARRE = 72;  // espace vertical réservé à la barre de contrôle
const SEUIL_TELEPHONE = 760; // en dessous : une seule page

export default function FlipbookViewer({ src, onClose }) {
  const livreRef = useRef(null);
  const [pages, setPages] = useState(null); // [{ dataUrl }] une fois rendues
  const [ratio, setRatio] = useState(null); // largeur/hauteur d'une page
  const [phase, setPhase] = useState('telechargement'); // 'telechargement' | 'rendu'
  const [pctTelechargement, setPctTelechargement] = useState(0);
  const [pctRendu, setPctRendu] = useState(0);
  const [erreur, setErreur] = useState(null);
  const [pageCourante, setPageCourante] = useState(0);
  const [nbPages, setNbPages] = useState(0);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [vp, setVp] = useState({ w: 1200, h: 800 });
  const [souris, setSouris] = useState(false);
  const pageCouranteRef = useRef(0);
  pageCouranteRef.current = pageCourante;
  const mouseDownSurFondRef = useRef(false);
  const dernierWheelRef = useRef(0);
  const dragRef = useRef(null);

  useEffect(() => {
    setSouris(window.matchMedia?.('(pointer: fine)')?.matches ?? false);
    const maj = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    maj();
    window.addEventListener('resize', maj);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', maj);
      document.body.style.overflow = '';
    };
  }, []);

  // Chargement du PDF (phase 1) puis pré-rendu de chaque page en image (phase 2).
  // Les deux peuvent être longues sur un livret lourd / une connexion lente —
  // chacune alimente la barre de progression.
  useEffect(() => {
    let annule = false;
    let unsubscribe = () => {};
    setPages(null);
    setRatio(null);
    setErreur(null);
    setPhase('telechargement');
    setPctTelechargement(0);
    setPctRendu(0);

    import('pdfjs-dist').then((pdfjsLib) => {
      if (annule) return Promise.reject(new Error('annulé'));
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      const proxied = `/api/pdf-proxy?url=${encodeURIComponent(src)}`;
      // Même cache partagé (clé = URL) que le préchargement d'AlbumLivrets : on
      // réutilise le téléchargement déjà lancé au lieu d'en relancer un second.
      const { promise, unsubscribe: unsub } = chargerDocumentPartage(
        pdfjsLib, proxied, { url: proxied, cMapUrl: '/cmaps/', cMapPacked: true },
        (pct) => { if (!annule) setPctTelechargement(pct); },
      );
      unsubscribe = unsub;
      return promise;
    }).then(async (doc) => {
      if (annule) return;
      setPctTelechargement(100);
      setPhase('rendu');
      const rendues = [];
      for (let i = 1; i <= doc.numPages; i++) {
        if (annule) return;
        const page = await doc.getPage(i);
        const base = page.getViewport({ scale: 1 });
        if (i === 1) setRatio(base.width / base.height);
        const scale = LARGEUR_RENDU_CIBLE / base.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        rendues.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.92) });
        if (!annule) setPctRendu(Math.round((i / doc.numPages) * 100));
      }
      if (!annule) setPages(rendues);
    }).catch((e) => {
      if (!annule && e?.message !== 'annulé') setErreur('Impossible de charger le livret.');
    });

    return () => { annule = true; unsubscribe(); };
  }, [src]);

  // En mode portrait (une page), `flipPrev()`/`flipNext()` sans coin explicite
  // sautent SANS animation. Passer par `flip(pageCible, 'bottom')` force
  // l'animation de tournage dans les deux sens.
  const flipNext = useCallback(() => {
    const pf = livreRef.current?.pageFlip?.();
    if (!pf) return;
    const n = pf.getPageCount?.() ?? 0;
    const cible = Math.min((pf.getCurrentPageIndex?.() ?? pageCouranteRef.current) + 1, n - 1);
    pf.flip ? pf.flip(cible, 'bottom') : pf.flipNext();
  }, []);
  const flipPrev = useCallback(() => {
    const pf = livreRef.current?.pageFlip?.();
    if (!pf) return;
    const cible = Math.max((pf.getCurrentPageIndex?.() ?? pageCouranteRef.current) - 1, 0);
    pf.flip ? pf.flip(cible, 'bottom') : pf.flipPrev();
  }, []);

  // Dézoome et recentre (retour à l'affichage « page entière »).
  const reinitZoom = useCallback(() => {
    setZoomIdx(0);
    setPan({ x: 0, y: 0 });
  }, []);

  // Tourner une page via les flèches/clavier : on dézoome d'abord, puis on tourne.
  const tourner = useCallback((dir) => {
    reinitZoom();
    if (dir === 'next') flipNext();
    else flipPrev();
  }, [reinitZoom, flipNext, flipPrev]);

  const zoomIn = useCallback(() => setZoomIdx((z) => Math.min(PALIERS_ZOOM.length - 1, z + 1)), []);
  const zoomOut = useCallback(() => setZoomIdx((z) => {
    const n = Math.max(0, z - 1);
    if (n === 0) setPan({ x: 0, y: 0 });
    return n;
  }), []);

  // Clavier : Échap ferme, flèches tournent (en dézoomant), +/- zooment.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') tourner('next');
      else if (e.key === 'ArrowLeft') tourner('prev');
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-') zoomOut();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, tourner, zoomIn, zoomOut]);

  // Molette = zoom (throttle pour ne pas sauter tous les paliers d'un coup).
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (now - dernierWheelRef.current < 120) return;
      dernierWheelRef.current = now;
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [zoomIn, zoomOut]);

  const deuxPages = vp.w >= SEUIL_TELEPHONE;
  const zoom = PALIERS_ZOOM[zoomIdx];

  // Déplacement (glissé) quand c'est zoomé — borné pour ne pas sortir le livret
  // du cadre. Pas de scrollbar : tout passe par le transform. Le `pan` est en
  // pixels ÉCRAN (transform: translate(pan) scale(z) → la translation s'ajoute
  // APRÈS la mise à l'échelle). On autorise à amener chaque bord du livret
  // jusqu'au bord du viewport (débordement = (tailleLivre×z − viewport)/2), plus
  // une marge pour pouvoir dépasser un peu (notamment passer sous la barre de
  // contrôle en bas).
  const bornerPan = useCallback((x, y, z, wLivre, hLivre) => {
    if (z <= 1) return { x: 0, y: 0 };
    const maxX = Math.max(0, (wLivre * z - vp.w) / 2) + 48;
    const maxY = Math.max(0, (hLivre * z - vp.h) / 2) + 96;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, [vp.w, vp.h]);

  const btn = {
    background: 'transparent', border: '0.5px solid #aaa', color: '#aaa',
    fontSize: '14px', padding: '4px 12px', cursor: 'pointer', borderRadius: '4px',
  };

  // --- Dimensions du livre : tout tient dans la fenêtre à zoom 1 ---
  // availW/availH = zone utile une fois retirés 2 cm de marge sur chaque côté
  // (+ la place de la barre en bas). On en déduit la hauteur d'UNE page telle
  // que l'empan complet (2 pages en mode normal, 1 en mode téléphone) rentre
  // entièrement, en largeur ET en hauteur.
  const availW = Math.max(120, vp.w - 2 * PAD);
  const availH = Math.max(120, vp.h - 2 * PAD - RESERVE_BARRE);
  let h = 0, w = 0, largeurLivre = 0;
  if (ratio) {
    const diviseur = deuxPages ? 2 : 1;
    h = Math.floor(Math.min(availH, availW / (diviseur * ratio)));
    w = Math.floor(h * ratio);
    largeurLivre = w * diviseur;
  }

  // --- Contenu central : erreur / progression / livre ---
  let centre;
  if (erreur) {
    centre = <p style={{ color: '#c17d6a', fontSize: '13px', textAlign: 'center' }}>{erreur}</p>;
  } else if (!pages || !ratio) {
    const pct = phase === 'telechargement' ? pctTelechargement : pctRendu;
    const label = phase === 'telechargement' ? 'Téléchargement du livret' : 'Préparation des pages';
    centre = (
      <div style={{ textAlign: 'center' }} onMouseDown={(e) => e.stopPropagation()}>
        <p style={{ color: '#ddd', fontSize: '13px', letterSpacing: '0.04em' }}>{label}…</p>
        <div style={{ width: '220px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '10px auto 6px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(255,255,255,0.65)', transition: 'width 0.2s ease' }} />
        </div>
        <p style={{ color: '#999', fontSize: '11px' }}>{pct} %</p>
      </div>
    );
  } else {
    // Pan borné AU RENDU : même si le pan stocké devient trop grand après un
    // changement de zoom (ex. on dézoome), la valeur AFFICHÉE reste dans les
    // limites → l'image ne peut jamais sortir de l'écran.
    const panAff = bornerPan(pan.x, pan.y, zoom, largeurLivre, h);
    centre = (
      // Wrapper transformé (zoom + déplacement). Quand c'est zoomé, CE wrapper
      // gère le déplacement (pan) au glissé — et le livre en dessous reçoit
      // `pointerEvents:none` pour que StPageFlip soit totalement sourd (aucun
      // fold parasite, aucun « reset »). À zoom 1 le livre reprend ses
      // pointer-events et le tourne-page natif (corne au coin) fonctionne.
      <div
        onPointerDown={(e) => {
          if (zoom <= 1) return; // zoom 1 : laisser StPageFlip gérer nativement
          e.currentTarget.setPointerCapture(e.pointerId);
          dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          const dx = e.clientX - dragRef.current.x;
          const dy = e.clientY - dragRef.current.y;
          setPan(bornerPan(dragRef.current.panX + dx, dragRef.current.panY + dy, zoom, largeurLivre, h));
        }}
        onPointerUp={() => { dragRef.current = null; }}
        style={{
          position: 'relative',
          // Au repos (zoom 1, pas de pan) AUCUN transform — un transform identité
          // forcerait un calque GPU ré-échantillonné (texte/images plus flous).
          transform: (zoom > 1 || panAff.x !== 0 || panAff.y !== 0)
            ? `translate(${panAff.x}px, ${panAff.y}px) scale(${zoom})`
            : 'none',
          transformOrigin: 'center center',
          transition: dragRef.current ? 'none' : 'transform 0.2s ease',
          cursor: zoom > 1 ? 'grab' : 'default',
        }}
      >
        <div style={{ width: `${largeurLivre}px`, height: `${h}px`, pointerEvents: zoom > 1 ? 'none' : 'auto' }}>
          <HTMLFlipBook
            // Remount quand la mise en page change (resize, bascule 1↔2 pages)
            // pour que StPageFlip se ré-initialise ; on repart de la page courante.
            key={`${deuxPages}-${w}x${h}`}
            ref={livreRef}
            width={w}
            height={h}
            size="fixed"
            showCover
            usePortrait
            mobileScrollSupport={false}
            maxShadowOpacity={0.25}
            drawShadow
            flippingTime={700}
            startPage={pageCouranteRef.current}
            className="flipbook-livret"
            style={{}}
            onFlip={(e) => setPageCourante(e.data)}
            onInit={(e) => setNbPages(e.object.getPageCount?.() ?? pages.length)}
          >
            {pages.map((p, i) => (
              <div key={i} style={{ background: '#fff' }}>
                <img src={p.dataUrl} alt={`Page ${i + 1}`} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {/* Zones tactiles gauche/droite — UNIQUEMENT en mode une page (téléphone)
            et à zoom 1. En portrait, la détection de coin native de StPageFlip
            est peu fiable au pointeur/tactile (surtout pour REVENIR en arrière à
            gauche) : on tappe donc le côté gauche/droit de la page pour
            reculer/avancer. `tourner()` appelle flipPrev/flipNext qui ANIMENT le
            tournage (le coin se corne via l'animation). Sur desktop (deux pages)
            on garde le pli natif au coin, qui lui fonctionne. */}
        {!deuxPages && zoom === 1 && (
          <>
            <div
              onClick={() => tourner('prev')}
              title="Page précédente"
              style={{ position: 'absolute', left: 0, top: 0, width: '45%', height: '100%', zIndex: 1, cursor: 'pointer' }}
            />
            <div
              onClick={() => tourner('next')}
              title="Page suivante"
              style={{ position: 'absolute', right: 0, top: 0, width: '45%', height: '100%', zIndex: 1, cursor: 'pointer' }}
            />
          </>
        )}
      </div>
    );
  }

  const flecheLaterale = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
    width: '48px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.4)', border: '0.5px solid rgba(255,255,255,0.25)',
    color: '#eee', borderRadius: '6px', cursor: 'pointer', fontSize: '26px', lineHeight: 1,
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
  };

  // Portal vers <body> : sinon un ancêtre avec `transform` (animation « in-view »
  // de la pochette, FadeIn…) devient le bloc conteneur du `position:fixed`, et
  // l'overlay n'occupe plus tout le viewport (barre mal placée, livret décadré,
  // surtout en portrait/téléphone). Le Lightbox est portalé pour la même raison.
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      onMouseDown={(e) => { mouseDownSurFondRef.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (mouseDownSurFondRef.current && e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,8,6,0.62)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        // Marge de 2 cm partout, + une réserve en bas pour la barre de contrôle
        // afin que le livret (centré dans l'espace restant) ne la chevauche pas.
        padding: '2cm', paddingBottom: 'calc(2cm + 72px)',
        overflow: 'hidden', cursor: 'default',
      }}
    >
      {centre}

      {/* Grandes flèches latérales (masquées pendant le chargement). */}
      {pages && <>
        <button onClick={tourner.bind(null, 'prev')} title="Page précédente" style={{ ...flecheLaterale, left: '16px' }}>‹</button>
        <button onClick={tourner.bind(null, 'next')} title="Page suivante" style={{ ...flecheLaterale, right: '16px' }}>›</button>
      </>}

      {/* Barre de contrôle. */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
          maxWidth: '92vw',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          padding: '6px 12px', borderRadius: '8px',
        }}
      >
        {souris && (
          <span style={{ color: '#9a9a9a', fontSize: '11px', padding: '0 10px 0 4px', whiteSpace: 'nowrap' }}>
            Molette&nbsp;: zoom&nbsp;·&nbsp;←/→&nbsp;: tourner
          </span>
        )}
        {pages && <>
          <span style={{ color: '#ccc', fontSize: '12px', padding: '0 4px', minWidth: '88px', textAlign: 'center' }}>
            Page {pageCourante + 1} / {nbPages || pages.length}
          </span>
          <span style={{ width: '1px', height: '20px', background: 'rgba(170,170,170,0.3)', margin: '0 4px' }} />
          <button onClick={zoomOut} disabled={zoomIdx === 0} style={{ ...btn, fontSize: '18px', padding: '4px 14px', opacity: zoomIdx === 0 ? 0.4 : 1 }}>−</button>
          <span style={{ color: '#ccc', fontSize: '12px', minWidth: '42px', textAlign: 'center' }}>{Math.round(zoom * 100)} %</span>
          <button onClick={zoomIn} disabled={zoomIdx === PALIERS_ZOOM.length - 1} style={{ ...btn, fontSize: '18px', padding: '4px 14px', opacity: zoomIdx === PALIERS_ZOOM.length - 1 ? 0.4 : 1 }}>+</button>
          <span style={{ width: '1px', height: '20px', background: 'rgba(170,170,170,0.3)', margin: '0 4px' }} />
        </>}
        <button
          onClick={onClose}
          style={{ ...btn, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px' }}
        >Fermer</button>
      </div>
    </div>,
    document.body,
  );
}
