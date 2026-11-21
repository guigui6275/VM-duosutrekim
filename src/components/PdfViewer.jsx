'use client';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { chargerDocumentPartage } from '@/lib/pdfDocumentCache';

// Rendu custom via pdf.js (canvas) plutôt que l'iframe/visionneuse native du
// navigateur : pas de panneau de vignettes de pages encombrant, et un rendu
// qui s'adapte correctement aux petits écrans (le viewer natif se comporte
// mal sur mobile, notamment iOS Safari). Composant contrôlé : le parent
// (Lightbox) possède le numéro de page et le zoom pour pouvoir les afficher
// dans sa propre barre de contrôle fixe.
//
// Deux modes :
// - continuous=false (défaut, ex. vignette de livret) : une seule page
//   rendue dans un seul <canvas>, ref transmise directement dessus.
// - continuous=true (visionneuse Lightbox) : toutes les pages du document
//   empilées verticalement dans un conteneur défilant, rendues à la demande
//   (IntersectionObserver) à l'approche du scroll plutôt que toutes d'un
//   coup — la ref est alors transmise au conteneur défilant (pas un canvas
//   précis). Le zoom y est appliqué en redimensionnant chaque <canvas>
//   (style.width/height, qui affecte le scroll) plutôt que via `transform`
//   (qui ne change PAS scrollHeight — le contenu zoomé débordait sans
//   pouvoir y défiler, et son centrage sur le milieu de tout le document
//   faisait "sauter" la page au lieu de zoomer sur ce qu'on regardait).
const OVERSAMPLE = () => Math.min((window.devicePixelRatio || 1) * 6, 12);

// Calcule la taille CSS affichée (arrondie à l'entier — une taille
// fractionnaire oblige le navigateur à ré-échantillonner même sans zoom) et
// l'échelle de rendu interne suréchantillonnée à partir de la largeur dispo.
function calculerEchelle(containerWidth, unscaledViewport) {
  const baseScale = containerWidth / unscaledViewport.width;
  const largeurAffichee = Math.round(baseScale * unscaledViewport.width);
  const hauteurAffichee = Math.round(baseScale * unscaledViewport.height);
  const echelleAffichee = largeurAffichee / unscaledViewport.width;
  return { largeurAffichee, hauteurAffichee, echelleAffichee };
}

async function rendrePage(page, canvas, containerWidth) {
  const unscaledViewport = page.getViewport({ scale: 1 });
  const { largeurAffichee, hauteurAffichee, echelleAffichee } = calculerEchelle(containerWidth, unscaledViewport);
  const viewport = page.getViewport({ scale: echelleAffichee * OVERSAMPLE() });
  const ctx = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = `${largeurAffichee}px`;
  canvas.style.height = `${hauteurAffichee}px`;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { largeurAffichee, hauteurAffichee };
}

// Convertit une chaîne `transform-origin` ('center center' ou 'NN% MM%') en
// fractions [0-1, 0-1] — utilisé pour centrer le zoom sur le curseur plutôt
// que systématiquement sur le centre de la zone visible.
function origineEnFractions(origin) {
  const parts = (origin || 'center center').trim().split(/\s+/);
  const parse = (v) => {
    if (v === 'center') return 0.5;
    if (v === 'left' || v === 'top') return 0;
    if (v === 'right' || v === 'bottom') return 1;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n / 100 : 0.5;
  };
  return [parse(parts[0]), parse(parts[1] ?? parts[0])];
}

const PdfViewer = forwardRef(function PdfViewer(
  { src, pageNum, onLoaded, onPageChange, zoom = 1, zoomOrigin = 'center center', pan = { x: 0, y: 0 }, dragging = false, continuous = false },
  forwardedRef,
) {
  const containerRef = useRef(null);
  const singleCanvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progression, setProgression] = useState(null); // 0-100, ou null si pas encore connue
  const [pagesRendues, setPagesRendues] = useState(() => new Set()); // indices déjà dessinés, pour l'indicateur par page en mode continu
  // Toujours à jour en lecture pour les closures d'effets qui n'ont pas
  // besoin de redéclencher sur un changement de zoom (ex. rendu à la demande).
  const zoomRef = useRef(zoom);
  const zoomOriginRef = useRef(zoomOrigin);
  zoomOriginRef.current = zoomOrigin;
  zoomRef.current = zoom;

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};
    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setProgression(null);

    import('pdfjs-dist').then((pdfjsLib) => {
      if (cancelled) return Promise.reject(new Error('annulé'));
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      // Document partagé avec le préchargement de AlbumLivrets.jsx (même clé
      // = même URL) : évite un second téléchargement concurrent du même
      // fichier, qui sur connexion lente retardait le DÉMARRAGE de celui-ci
      // (donc aucun `onProgress`, donc pas de barre de progression visible)
      // — voir pdfDocumentCache.js. cMapUrl/cMapPacked : requis pour que les
      // polices CJK (japonais) non entièrement incluses dans le PDF
      // retrouvent leurs glyphes — sans ça, silencieusement absentes.
      const { promise, unsubscribe: unsub } = chargerDocumentPartage(
        pdfjsLib, src, { url: src, cMapUrl: '/cmaps/', cMapPacked: true },
        (pct) => { if (!cancelled) setProgression(pct); },
      );
      unsubscribe = unsub;
      return promise;
    }).then((doc) => {
      if (cancelled) return;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      onLoaded?.(doc.numPages);
      setLoading(false);
    }).catch((e) => {
      if (!cancelled) { setError(e.message || 'Impossible de charger le document.'); setLoading(false); }
    });

    return () => { cancelled = true; unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // ── Mode page unique (vignette de livret) : pas de zoom/scroll, inchangé ──
  useEffect(() => {
    if (continuous || !pdfDoc || !singleCanvasRef.current || !containerRef.current) return;
    let cancelled = false;
    const render = () => {
      pdfDoc.getPage(pageNum || 1).then((page) => {
        if (cancelled || !containerRef.current) return;
        rendrePage(page, singleCanvasRef.current, containerRef.current.clientWidth);
      });
    };
    render();
    window.addEventListener('resize', render);
    return () => { cancelled = true; window.removeEventListener('resize', render); };
  }, [continuous, pdfDoc, pageNum]);

  // ── Mode continu (visionneuse) : rendu à la demande au défilement ──
  const pageRefs = useRef([]);
  const renderedRef = useRef(new Set());
  const baseSizesRef = useRef([]); // taille affichée à zoom=1 par page, pour pouvoir la remultiplier au zoom courant
  pageRefs.current = [];

  useEffect(() => {
    if (!continuous || !pdfDoc || !containerRef.current) return;
    renderedRef.current = new Set();
    baseSizesRef.current = [];
    setPagesRendues(new Set());
    let cancelled = false;

    // Les canvases sont récupérés par requête DOM (via leur data-page-index)
    // plutôt que par `pageRefs.current` : ce tableau est remis à [] à chaque
    // rendu puis repeuplé par les callbacks de ref, et sous charge (réseau
    // saturé par le préchargement) un rendu pouvait s'intercaler entre cet
    // effet et son requestAnimationFrame, laissant `pageRefs.current` vide au
    // moment où on attachait l'observer → observer posé sur 0 canvas → AUCUNE
    // page jamais rendue (toutes transparentes, spinner éternel). Le DOM, lui,
    // est toujours à jour. (pageRefs reste utilisé par les effets d'inter-
    // action zoom/pan/resize, qui tournent bien après le montage, pageRefs
    // alors stable.)
    const getCanvas = (index) => containerRef.current?.querySelector(`canvas[data-page-index="${index}"]`) || null;
    const getAllCanvas = () => (containerRef.current ? Array.from(containerRef.current.querySelectorAll('canvas[data-page-index]')) : []);

    const appliquerZoomCourant = (canvas, base) => {
      canvas.style.width = `${Math.round(base.largeurAffichee * zoomRef.current)}px`;
      canvas.style.height = `${Math.round(base.hauteurAffichee * zoomRef.current)}px`;
    };

    const rendrePageIndex = async (index) => {
      const canvas = getCanvas(index);
      if (!canvas || cancelled) return;
      try {
        const page = await pdfDoc.getPage(index + 1);
        if (cancelled) return;
        const base = await rendrePage(page, canvas, containerRef.current.clientWidth);
        baseSizesRef.current[index] = base;
        if (zoomRef.current !== 1) appliquerZoomCourant(canvas, base);
        if (!cancelled) setPagesRendues((prev) => new Set(prev).add(index));
      } catch (e) {
        // Un rendu qui échoue (cmap manquante, worker mort, getPage qui
        // rejette...) ne doit JAMAIS laisser le spinner tourner indéfiniment :
        // on retire le spinner (page marquée "traitée") plutôt que de rester
        // bloqué dessus. La page reste alors vide mais le reste du document
        // s'affiche normalement.
        if (!cancelled) setPagesRendues((prev) => new Set(prev).add(index));
        console.error(`Échec du rendu de la page ${index + 1} du PDF :`, e);
      }
    };

    // File d'attente à concurrence limitée ET PRIORITÉ À LA PAGE REGARDÉE.
    // Sans limite, toutes les pages entrées d'un coup dans la marge (saut,
    // défilement rapide) se rendaient en parallèle et se disputaient le thread
    // (un rendu = un gros canvas suréchantillonné, plusieurs secondes sous
    // CPU dégradé). Mais une simple file FIFO ne suffit pas : en sautant au
    // milieu du document, les pages AU-DESSUS de celle qu'on regarde entraient
    // dans la file AVANT elle (ordre d'index) et se rendaient d'abord — la
    // page réellement visible attendait derrière des pages de préchargement
    // qu'on ne regarde même pas, donnant l'impression qu'elle reste bloquée.
    // Correctif : à chaque créneau libre, on choisit la page EN ATTENTE la
    // plus proche du centre du cadre visible — ce qu'on regarde se rend
    // toujours en premier, le préchargement (haut/bas) ensuite.
    const CONCURRENCE_MAX = 2;
    const filePage = [];
    let enCours = 0;
    const prochainePage = () => {
      const root = containerRef.current;
      if (!root || filePage.length === 0) return undefined;
      const rootRect = root.getBoundingClientRect();
      const centreVue = rootRect.top + rootRect.height / 2;
      let meilleurPos = 0;
      let meilleureDist = Infinity;
      for (let i = 0; i < filePage.length; i++) {
        const canvas = getCanvas(filePage[i]);
        if (!canvas) { meilleurPos = i; break; }
        const r = canvas.getBoundingClientRect();
        const dist = Math.abs((r.top + r.height / 2) - centreVue);
        if (dist < meilleureDist) { meilleureDist = dist; meilleurPos = i; }
      }
      return filePage.splice(meilleurPos, 1)[0];
    };
    const traiterFile = () => {
      while (enCours < CONCURRENCE_MAX && filePage.length > 0) {
        const index = prochainePage();
        if (index === undefined) break;
        enCours++;
        rendrePageIndex(index).finally(() => {
          enCours--;
          traiterFile();
        });
      }
    };
    const demanderRendu = (index) => {
      if (renderedRef.current.has(index) || cancelled) return;
      renderedRef.current.add(index);
      filePage.push(index);
      traiterFile();
    };

    // Observer directement chaque <canvas> (data-page-index y est posé) —
    // PAS son parent, qui est le même conteneur flex partagé par toutes les
    // pages (observer le parent aurait fait remonter le même élément, donc
    // le même data-page-index indéfini, pour les 16 pages à la fois).
    // rootMargin généreux (≈1,5× la hauteur d'une page) : sous CPU/réseau
    // dégradés, un rendu peut prendre plusieurs secondes (mesuré) — sans
    // marge d'avance suffisante, la page entre dans le cadre AVANT que son
    // rendu n'ait eu le temps de se terminer, laissant voir le spinner.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.dataset.pageIndex);
          demanderRendu(index);
        }
      });
    }, { root: containerRef.current, rootMargin: '1600px 0px' });

    // Déclenche explicitement le rendu des pages actuellement dans le cadre
    // (+ la marge) — filet de sécurité en plus de l'IntersectionObserver, qui
    // ne déclenche pas toujours son callback initial de façon fiable juste au
    // montage (layout pas encore stabilisé). Garantit qu'au moins les
    // premières pages visibles se rendent même si l'observer tarde.
    const declencherPagesVisibles = () => {
      const root = containerRef.current;
      if (!root) return;
      const rootRect = root.getBoundingClientRect();
      const marge = 1600;
      getAllCanvas().forEach((canvas) => {
        const r = canvas.getBoundingClientRect();
        if (r.bottom > rootRect.top - marge && r.top < rootRect.bottom + marge) {
          demanderRendu(Number(canvas.dataset.pageIndex));
        }
      });
    };

    // Affine les hauteurs placeholder à partir de la vraie taille de chaque
    // page, pour réduire les micro-sauts de scroll quand une page passe de la
    // taille CSS (carrée, cf. règle `aspect-ratio:1/1`) à sa vraie taille au
    // rendu. **NON bloquant et best-effort** : séquentiel, chaque page
    // protégée par try/catch — si un `getPage` stagne (connexion réelle
    // lente), ça n'empêche RIEN d'autre (surtout pas l'attachement de
    // l'observer ni le rendu). C'était l'inverse avant : l'observer n'était
    // attaché qu'APRÈS un `Promise.all` sur les getPage des 20 pages, donc un
    // seul getPage bloqué = observer jamais posé = toutes les pages
    // transparentes avec spinner éternel. La réservation de hauteur qui
    // empêche l'effondrement du scroll est désormais assurée par le CSS.
    const affinerHauteurs = async () => {
      const containerWidth = containerRef.current?.clientWidth;
      if (!containerWidth) return;
      const canvases = getAllCanvas();
      for (const canvas of canvases) {
        if (cancelled) return;
        const index = Number(canvas.dataset.pageIndex);
        try {
          const page = await pdfDoc.getPage(index + 1);
          if (cancelled) return;
          const base = calculerEchelle(containerWidth, page.getViewport({ scale: 1 }));
          baseSizesRef.current[index] = base;
          // Ne pas écraser une page déjà prise en charge par le rendu (elle
          // porte déjà sa vraie taille, ou est en cours de rendu).
          if (!renderedRef.current.has(index)) {
            canvas.style.width = `${base.largeurAffichee}px`;
            canvas.style.height = `${base.hauteurAffichee}px`;
            if (zoomRef.current !== 1) appliquerZoomCourant(canvas, base);
          }
        } catch {
          // best-effort : une page dont la mesure échoue garde sa taille CSS.
        }
      }
    };

    // Attache l'observer IMMÉDIATEMENT une fois les canvases montés — sans
    // attendre aucun getPage (voir le long commentaire d'affinerHauteurs sur
    // la raison). Puis déclenche les pages déjà visibles, et lance l'affinage
    // des hauteurs en arrière-plan. Les canvases viennent du DOM (toujours à
    // jour), pas de pageRefs.current (qui peut être transitoirement vide).
    const attacher = () => {
      if (cancelled) return;
      const canvases = getAllCanvas();
      // Garde défensive : si le DOM n'a pas encore les canvases (rendu pas
      // encore commité), réessaie à la frame suivante au lieu d'attacher sur
      // du vide (ce qui laissait TOUT le document avec un spinner éternel).
      if (canvases.length === 0) { requestAnimationFrame(attacher); return; }
      canvases.forEach((canvas) => observer.observe(canvas));
      declencherPagesVisibles();
      affinerHauteurs();
    };
    const idAnim = requestAnimationFrame(attacher);

    // Repère la page la plus visible pour synchroniser l'indicateur "Page X / N".
    const pageVisibilityObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) onPageChange?.(Number(visible.target.dataset.pageIndex) + 1);
    }, { root: containerRef.current, threshold: [0.5] });
    const idAnim2 = requestAnimationFrame(() => {
      pageRefs.current.forEach((canvas) => {
        if (canvas) pageVisibilityObserver.observe(canvas);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(idAnim);
      cancelAnimationFrame(idAnim2);
      observer.disconnect();
      pageVisibilityObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continuous, pdfDoc, numPages]);

  // ── Redimensionnement (mode continu) : les <canvas> ont une taille figée
  // en pixels au moment de leur rendu — le conteneur suit le CSS (vw/vh) au
  // redimensionnement, mais sans ce correctif les pages gardaient leur
  // ancienne taille (pas "responsive"). Probable aussi source du flou
  // signalé sur mobile : la largeur mesurée tout de suite au montage peut
  // être fausse avant que la barre d'adresse du navigateur ne se stabilise
  // (changement de hauteur de viewport déclenche ce même ResizeObserver, ce
  // qui corrige le rendu après coup au lieu de rester figé sur une mesure
  // initiale erronée).
  useEffect(() => {
    if (!continuous || !pdfDoc || !containerRef.current) return;
    const container = containerRef.current;
    let cancelled = false;
    let debounceId = null;
    let premierAppel = true; // ResizeObserver déclenche un 1er appel immédiat à l'observe() — déjà couvert par l'effet de montage ci-dessus.

    const appliquerZoomCourant = (canvas, base) => {
      canvas.style.width = `${Math.round(base.largeurAffichee * zoomRef.current)}px`;
      canvas.style.height = `${Math.round(base.hauteurAffichee * zoomRef.current)}px`;
    };

    const redimensionnerTout = async () => {
      if (cancelled) return;
      const containerWidth = container.clientWidth;
      const scrollable = container.scrollHeight > container.clientHeight;
      const fraction = scrollable ? container.scrollTop / (container.scrollHeight - container.clientHeight) : 0;

      await Promise.all(pageRefs.current.map(async (canvas, index) => {
        if (!canvas || cancelled) return;
        const page = await pdfDoc.getPage(index + 1);
        if (cancelled) return;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const base = calculerEchelle(containerWidth, unscaledViewport);
        baseSizesRef.current[index] = base;
        if (renderedRef.current.has(index)) {
          await rendrePage(page, canvas, containerWidth);
        } else {
          canvas.style.width = `${base.largeurAffichee}px`;
          canvas.style.height = `${base.hauteurAffichee}px`;
        }
        if (zoomRef.current !== 1) appliquerZoomCourant(canvas, base);
      }));

      if (!cancelled && container.scrollHeight > container.clientHeight) {
        container.scrollTop = fraction * (container.scrollHeight - container.clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (premierAppel) { premierAppel = false; return; }
      clearTimeout(debounceId);
      debounceId = setTimeout(redimensionnerTout, 200);
    });
    // box:'border-box' — la taille CSS du conteneur (fixée par son parent,
    // voir Lightbox.jsx) ne change jamais à cause de SON PROPRE zoom, mais la
    // taille `content-box` (mesure par défaut), elle, RÉTRÉCIT dès qu'une
    // barre de défilement apparaît (zoom qui fait déborder une page) — sans
    // ce réglage, chaque passage zoom=1 ↔ zoomé déclenchait à tort ce resize
    // observer, qui re-rend entièrement les pages déjà affichées (donc les
    // vide un instant via `canvas.width=...`, avant le nouveau rendu async) :
    // c'est la cause du "l'image disparaît puis réapparaît" au zoom/dézoom.
    resizeObserver.observe(container, { box: 'border-box' });

    return () => {
      cancelled = true;
      clearTimeout(debounceId);
      resizeObserver.disconnect();
    };
  }, [continuous, pdfDoc]);

  // Défilement vers la page demandée depuis l'extérieur (boutons ←/→ du Lightbox).
  const dernierPageNumDemande = useRef(null);
  useEffect(() => {
    if (!continuous || !pageNum || pageNum === dernierPageNumDemande.current) return;
    dernierPageNumDemande.current = pageNum;
    const canvas = pageRefs.current[pageNum - 1];
    canvas?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [continuous, pageNum]);

  // ── Zoom (mode continu) : redimensionne chaque page (affecte le scroll,
  // contrairement à `transform`) et recentre le scroll sur le même point du
  // contenu pour que zoomer ne fasse pas "sauter" la page — centré sur le
  // curseur (zoomOrigin) pour un zoom molette, sur le centre de la zone
  // visible pour un zoom par bouton (zoomOrigin='center center' alors).
  // Le recalcul du scroll se fait SYNCHRONEMENT juste après le redimension-
  // nement (pas de requestAnimationFrame) : sinon le navigateur peint une
  // frame intermédiaire avec les pages déjà agrandies mais l'ancien scroll —
  // un flash visible d'un instant avant que le scroll ne se corrige.
  const prevZoomRef = useRef(1);
  useEffect(() => {
    if (!continuous || !containerRef.current) return;
    const container = containerRef.current;
    const oldZoom = prevZoomRef.current;
    prevZoomRef.current = zoom;
    if (zoom === oldZoom) return;

    const clientW = container.clientWidth;
    const clientH = container.clientHeight;
    const [ox, oy] = origineEnFractions(zoomOriginRef.current);
    const pivotX = ox * clientW;
    const pivotY = oy * clientH;
    const focusXNonZoome = (container.scrollLeft + pivotX) / oldZoom;
    const focusYNonZoome = (container.scrollTop + pivotY) / oldZoom;

    pageRefs.current.forEach((canvas, i) => {
      const base = baseSizesRef.current[i];
      if (!canvas || !base) return;
      canvas.style.width = `${Math.round(base.largeurAffichee * zoom)}px`;
      canvas.style.height = `${Math.round(base.hauteurAffichee * zoom)}px`;
    });

    container.scrollLeft = focusXNonZoome * zoom - pivotX;
    container.scrollTop = focusYNonZoome * zoom - pivotY;
  }, [continuous, zoom]);

  // ── Pan (glisser-déposer, mode continu) : applique le DELTA de `pan`
  // (depuis la dernière valeur connue) au scroll réel, plutôt que de
  // recalculer une position absolue à partir d'une capture du scroll prise
  // au début du geste. Cette dernière approche désynchronisait `pan` (qui
  // continue de croître avec la souris même une fois le scroll arrivé en
  // butée côté navigateur, qui lui se clampe) du scroll réel — au geste de
  // drag suivant, une partie du mouvement "rattrapait" cet écart avant
  // d'avoir le moindre effet visible (symptôme observé : possible d'aller
  // jusqu'en butée à droite, mais le retour vers la gauche restait bloqué).
  // Avec un delta appliqué directement au scroll courant (déjà clampé par
  // le navigateur), il n'y a plus d'état caché à rattraper.
  const prevPanRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!continuous || !containerRef.current) return;
    const container = containerRef.current;
    const dx = pan.x - prevPanRef.current.x;
    const dy = pan.y - prevPanRef.current.y;
    prevPanRef.current = { x: pan.x, y: pan.y };
    if (!dragging) return; // un reset de `pan` à {0,0} hors drag ne doit pas scroller
    container.scrollLeft -= dx;
    container.scrollTop -= dy;
  }, [continuous, dragging, pan]);

  if (continuous) {
    return (
      <div
        ref={(el) => { containerRef.current = el; if (forwardedRef) forwardedRef.current = el; }}
        style={{ width: '100%', height: '100%', overflow: 'auto', cursor: 'inherit' }}
      >
        {loading && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#ccc', fontSize: '13px' }}>Chargement du document{progression != null ? ` (${progression} %)` : '...'}</p>
            {progression != null && (
              <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '8px auto', overflow: 'hidden' }}>
                <div style={{ width: `${progression}%`, height: '100%', background: 'rgba(255,255,255,0.6)', transition: 'width 0.2s ease' }} />
              </div>
            )}
          </div>
        )}
        {error && <p style={{ color: '#c17d6a', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>{error}</p>}
        {!loading && !error && (
          // alignItems:'stretch' (pas 'center', qui piège le scroll — voir
          // feedback_css_flex_center_overflow_scroll_trap — ni 'flex-start',
          // qui laissait chaque page à sa largeur de CONTENU, donc à la
          // taille par défaut minuscule du <canvas> (300×150) tant que JS n'a
          // pas encore mesuré/appliqué la vraie largeur — visible comme une
          // pile de petites pages qui tournent en rond sur connexion lente).
          // `stretch` fait immédiatement occuper toute la largeur disponible
          // à chaque wrapper (et donc au spinner, positionné dessus), sans
          // réintroduire le piège de centrage (le bord gauche de chaque
          // wrapper reste à x=0, stretch ne fait qu'étendre sa largeur).
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '16px', padding: '0 0 16px' }}>
            {Array.from({ length: numPages }, (_, i) => (
              <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                <canvas
                  data-page-index={i}
                  ref={(el) => { pageRefs.current[i] = el; }}
                  style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)', display: 'block' }}
                />
                {!pagesRendues.has(i) && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="pdf-spinner" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <style jsx>{`
          /* Gabarit par défaut appliqué par CSS pur, disponible dès la
             première peinture — avant même que le JS (async, donc jamais
             instantané sur connexion lente) n'ait pu mesurer et appliquer la
             vraie taille de chaque page. Un style inline (posé ensuite via
             canvas.style.width/height) prévaut toujours sur cette règle. */
          canvas[data-page-index] {
            width: 100%;
            aspect-ratio: 1 / 1;
          }
          .pdf-spinner {
            width: 28px; height: 28px;
            border: 3px solid rgba(255,255,255,0.15);
            border-top-color: rgba(255,255,255,0.6);
            border-radius: 50%;
            animation: pdf-spin 0.8s linear infinite;
          }
          @keyframes pdf-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', overflowX: 'hidden' }}>
      {loading && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ccc', fontSize: '13px' }}>Chargement du document{progression != null ? ` (${progression} %)` : '...'}</p>
          {progression != null && (
            <div style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '8px auto', overflow: 'hidden' }}>
              <div style={{ width: `${progression}%`, height: '100%', background: 'rgba(255,255,255,0.6)', transition: 'width 0.2s ease' }} />
            </div>
          )}
        </div>
      )}
      {error && <p style={{ color: '#c17d6a', fontSize: '13px' }}>{error}</p>}
      <canvas
        ref={(el) => { singleCanvasRef.current = el; if (forwardedRef) forwardedRef.current = el; }}
        style={{
          maxWidth: loading || error ? 0 : '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          cursor: 'inherit',
        }}
      />
    </div>
  );
});

export default PdfViewer;
