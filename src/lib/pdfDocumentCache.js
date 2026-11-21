// Cache partagé de documents pdf.js en cours/déjà chargés, keyé par URL.
//
// AlbumLivrets.jsx précharge en arrière-plan tous les livrets d'un album dès
// l'affichage de la fiche (pour une ouverture instantanée). Sans ce module,
// PdfViewer.jsx refaisait son propre `getDocument()` indépendant à l'ouverture
// du Lightbox — un DEUXIÈME téléchargement du même fichier, qui entrait en
// concurrence avec le préchargement pour la bande passante disponible. Sur une
// connexion lente, ça pouvait retarder de plusieurs secondes le DÉMARRAGE
// (pas juste la fin) du téléchargement déclenché par le clic de l'utilisateur
// — pendant cette attente, aucun évènement `onProgress` ne se déclenche (la
// requête n'a pas encore été envoyée), donc aucune barre de progression ne
// pouvait s'afficher, contrairement à un article de presse (pas de
// préchargement concurrent, le téléchargement démarre immédiatement).
//
// Partager le même document résout les deux problèmes à la fois : plus de
// double-téléchargement, et la progression (même démarrée par le
// préchargement) reste observable par quiconque s'y abonne ensuite.
const cache = new Map();
const LIMITE_CACHE = 20; // évite une croissance illimitée sur une session longue

export function chargerDocumentPartage(pdfjsLib, src, options, onProgress) {
  let entree = cache.get(src);
  if (!entree) {
    if (cache.size >= LIMITE_CACHE) {
      cache.delete(cache.keys().next().value); // plus ancien, insertion-order
    }
    const listeners = new Set();
    const etat = { progression: null };
    const tache = pdfjsLib.getDocument(options);
    tache.onProgress = ({ loaded, total }) => {
      if (!total) return;
      etat.progression = Math.round((loaded / total) * 100);
      listeners.forEach((fn) => fn(etat.progression));
    };
    const promise = tache.promise.catch((e) => {
      cache.delete(src); // ne garde pas un échec en cache
      throw e;
    });
    entree = { promise, listeners, etat };
    cache.set(src, entree);
  }

  if (onProgress) {
    entree.listeners.add(onProgress);
    if (entree.etat.progression != null) onProgress(entree.etat.progression);
  }

  return {
    promise: entree.promise,
    unsubscribe: onProgress ? () => entree.listeners.delete(onProgress) : () => {},
  };
}
