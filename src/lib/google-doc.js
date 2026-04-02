/**
 * Récupère le contenu d'un Google Doc publié sous forme
 * d'un tableau de paragraphes (texte brut, pas de HTML).
 *
 * @param {string} pubUrl - URL de publication du Google Doc (format /pub)
 * @param {object} [options]
 * @param {number} [options.revalidate=3600] - Durée du cache en secondes
 * @param {string} [options.startAfter] - Texte marqueur de début du vrai contenu
 * @returns {string[]|null} Tableau de paragraphes, ou null en cas d'erreur
 *
 * Exemple :
 *   const paragraphes = await getGoogleDoc(GOOGLE_DOCS.biographieFR.url, GOOGLE_DOCS.biographieFR.options);
 *   // ['Guillaume SUTRE n\'a que 18 ans...', 'Originaire de Douai...', ...]
 */
export async function getGoogleDoc(pubUrl, options = {}) {
  const { revalidate = 3600, startAfter } = options;

  try {
    const res = await fetch(pubUrl, {
      next: { revalidate },
    });

    if (!res.ok) {
      console.error(`Erreur fetch Google Doc (${pubUrl}):`, res.status);
      return null;
    }

    const html = await res.text();
    return extraireParagraphes(html, startAfter);
  } catch (err) {
    console.error(`Erreur récupération Google Doc (${pubUrl}):`, err);
    return null;
  }
}

/**
 * URLs et options des Google Docs publiés.
 */
export const GOOGLE_DOCS = {
  biographieCompleteDSK: {
    url: 'https://docs.google.com/document/d/e/2PACX-1vSe7BUPhUkHKksS6obi5ECe2cCTxJWvXNg4l6VZgWUCXuvQrY885bF9H8jgedWhwir4_uSOe86-cg0a/pub',
    options: {
      startAfter: 'Le Duo Sutre-Kim',
    },
  },
  biographieCourteDSK: {
    url: 'https://docs.google.com/document/d/e/2PACX-1vR9S-7czTzlkoTjRYm6WQNwkQhbKJVM-zamA-A_nLua4ETHfN6_aicRvzV1m6R9c_k79Sl7x4OtBkku/pub',
    options: {
      startAfter: 'Fondé à Paris',
    },
  },
  // biographieEN: { url: '...', options: { startAfter: 'Guillaume SUTRE' } },
};

/**
 * Extrait les paragraphes de texte brut depuis le HTML Google Docs.
 * Retourne un tableau de chaînes (une par paragraphe non vide).
 */
function extraireParagraphes(html, startAfter) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return null;

  let contenu = bodyMatch[1];

  // Supprimer les balises non textuelles
  contenu = contenu.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  contenu = contenu.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Extraire le texte de chaque balise <p>
  const regexP = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const paragraphes = [];
  let match;

  while ((match = regexP.exec(contenu)) !== null) {
    // Supprimer toutes les balises HTML du contenu du paragraphe
    let texte = match[1]
      .replace(/<[^>]+>/g, '')     // supprimer les balises
      .replace(/&nbsp;/g, ' ')     // espaces insécables
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')        // normaliser les espaces
      .trim();

    if (texte.length > 0) {
      paragraphes.push(texte);
    }
  }

  if (paragraphes.length === 0) return null;

  // Couper le préambule si startAfter est défini
  if (startAfter) {
    const idx = paragraphes.findIndex(p => p.includes(startAfter));
    if (idx !== -1) {
      return paragraphes.slice(idx);
    }
  }

  return paragraphes;
}
