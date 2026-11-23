'use client';
import { useEffect, useRef, useState } from 'react';
import PdfViewer from '@/components/PdfViewer';
import FlipbookViewer from '@/components/FlipbookViewer';
import { chargerDocumentPartage } from '@/lib/pdfDocumentCache';

export const LABELS_LANGUE = {
  FR: 'Français', EN: 'English', ES: 'Español', DE: 'Deutsch',
  IT: 'Italiano', JP: '日本語', NL: 'Nederlands', PT: 'Português',
};

// Un livret bilingue stocke ses deux langues dans le même champ `langue`,
// séparées par un « / » (ex. "FR/EN") → un seul PDF, une seule pastille.
export function languesDe(langue) {
  return (langue || '').split('/').map((s) => s.trim().toUpperCase()).filter(Boolean);
}
export function libelleLangues(langue) {
  const codes = languesDe(langue);
  if (codes.length === 0) return 'Livret';
  return codes.map((c) => LABELS_LANGUE[c] || c).join(' / ');
}

// Petits drapeaux ronds (SVG dans /public/flags/, nommés par code de langue)
// en bas à droite de la vignette — même esprit que ceux intégrés dans
// certains livrets imprimés. N'affiche que les langues pour lesquelles un
// drapeau existe.
function Drapeaux({ langue }) {
  const codes = languesDe(langue).filter((c) => LABELS_LANGUE[c]);
  if (codes.length === 0) return null;
  return (
    <div style={{ position: 'absolute', bottom: '6px', right: '6px', display: 'flex', gap: '3px', pointerEvents: 'none' }}>
      {codes.map((c) => (
        <img
          key={c}
          src={`/flags/${c}.svg`}
          alt={LABELS_LANGUE[c] || c}
          width={22}
          height={22}
          style={{ width: '22px', height: '22px', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.45)', display: 'block' }}
        />
      ))}
    </div>
  );
}

// PdfViewer est un forwardRef : sans ref transmise, son effet de rendu sur
// canvas s'arrête avant de dessiner quoi que ce soit (vignette vide).
// N'est utilisé qu'en repli, si jamais la vignette pré-générée manque.
function VignetteRendue({ fichier }) {
  const canvasRef = useRef(null);
  return <PdfViewer ref={canvasRef} src={`/api/pdf-proxy?url=${encodeURIComponent(fichier.url)}`} pageNum={1} zoom={1} pan={{ x: 0, y: 0 }} dragging={false} />;
}

export default function AlbumLivrets({ livrets = [] }) {
  const [selection, setSelection] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const livretActif = livrets[selection] || livrets[0];

  // Préchargement au montage. Les VIGNETTES de toutes les langues sont
  // préchargées (quelques Ko chacune, négligeable) pour que le sélecteur de
  // langue s'affiche instantanément. En revanche, SEUL le document PDF de la
  // langue par défaut est préchargé — surtout PAS les autres.
  //
  // Piège corrigé le 2026-11-15 (cause du bug "pages transparentes, spinner
  // éternel") : précharger EN ARRIÈRE-PLAN les documents PDF des autres
  // langues (plusieurs Mo chacun) saturait une connexion lente et STARVAIT
  // les requêtes `Range` que pdf.js émet à la demande pour récupérer le
  // contenu de chaque page du document RÉELLEMENT ouvert — `page.render()`
  // ne se terminait jamais (il attendait des octets bloqués derrière les
  // téléchargements de préchargement), les deux créneaux de rendu restaient
  // occupés, toute la file gelait, et AUCUNE page ne s'affichait. Le
  // préchargement de la seule langue par défaut (le même document que le
  // visionneur ouvre ensuite — cache partagé, zéro concurrence) garde
  // l'ouverture instantanée sans ce risque. Changer de langue charge ce
  // document-là à la demande (barre de progression, puis mis en cache HTTP
  // immuable pour les fois suivantes).
  useEffect(() => {
    if (livrets.length === 0) return;
    let annule = false;

    livrets.forEach((l) => {
      if (l.vignette?.url) new Image().src = l.vignette.url;
    });

    if (livretActif?.fichier?.url) {
      import('pdfjs-dist').then((pdfjsLib) => {
        if (annule) return;
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        const src = `/api/pdf-proxy?url=${encodeURIComponent(livretActif.fichier.url)}`;
        // Même cache partagé que PdfViewer.jsx (clé = URL) : à l'ouverture, le
        // Lightbox réutilise CE téléchargement déjà en cours au lieu d'en
        // relancer un second. Options identiques (cMapUrl/cMapPacked).
        chargerDocumentPartage(pdfjsLib, src, { url: src, cMapUrl: '/cmaps/', cMapPacked: true }).promise.catch(() => {});
      });
    }

    return () => { annule = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (livrets.length === 0) return null;

  return (
    <div>
      {/* Image statique pré-générée (rapide) plutôt qu'un rendu pdf.js — le
          rendu live ne sert plus que de repli si la vignette manque. */}
      <button
        onClick={() => setOuvert(true)}
        title="Feuilleter le livret"
        style={{
          // La couverture recadrée est quasi carrée (~1:1) — une boîte carrée
          // évite les bandeaux vides que laissait un format portrait avec
          // object-fit:contain.
          position: 'relative',
          width: '140px',
          height: '140px',
          padding: 0,
          border: '0.5px solid var(--color-bordure)',
          background: 'var(--color-bg-alt)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {livretActif.vignette ? (
          <img src={livretActif.vignette.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        ) : (
          <VignetteRendue key={livretActif.id} fichier={livretActif.fichier} />
        )}
        {livretActif.afficher_drapeau && <Drapeaux langue={livretActif.langue} />}
      </button>

      {/* Libellé de langue sous la vignette — affiché même pour un seul livret
          (indication de la langue), cliquable seulement s'il y en a plusieurs. */}
      {livrets.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          {livrets.map((livret, i) => {
            const actif = i === selection;
            const unSeul = livrets.length === 1;
            return (
              <button
                key={livret.id}
                onClick={() => setSelection(i)}
                disabled={unSeul}
                title={libelleLangues(livret.langue)}
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: '300',
                  padding: '5px 10px',
                  border: `0.5px solid ${actif ? 'var(--color-or)' : 'var(--color-bordure)'}`,
                  color: actif ? 'var(--color-or)' : 'var(--color-texte-muted)',
                  background: 'transparent',
                  cursor: unSeul ? 'default' : 'pointer',
                }}
              >
                {livret.langue ? languesDe(livret.langue).join(' / ') : (unSeul ? libelleLangues(livret.langue) : i + 1)}
              </button>
            );
          })}
        </div>
      )}

      {ouvert && livretActif?.fichier?.url && (
        <FlipbookViewer
          src={livretActif.fichier.url}
          originalSrc={livretActif.fichier_original?.url || null}
          onClose={() => setOuvert(false)}
        />
      )}
    </div>
  );
}
