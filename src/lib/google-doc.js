/**
 * Récupère le contenu d'un Google Doc publié sous forme
 * d'un tableau de paragraphes (texte avec <em> préservé pour les passages
 * en italique dans le document d'origine).
 *
 * @param {string} pubUrl - URL de publication du Google Doc (format /pub)
 * @param {object} [options]
 * @param {number} [options.revalidate=3600] - Durée du cache en secondes
 * @param {string} [options.startAfter] - Texte marqueur du premier paragraphe à garder (inclus)
 * @returns {string[]|null} Tableau de paragraphes (HTML minimal : <em> seulement), ou null en cas d'erreur
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

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Extrait les paragraphes de texte depuis le HTML Google Docs, en
 * convertissant les <span> en italique (détectés via les classes CSS
 * générées par Google, ex: ".c8{font-style:italic}") en balises <em>.
 * Retourne un tableau de chaînes (une par paragraphe non vide).
 */
function extraireParagraphes(html, startAfter) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return null;

  // Google Docs publié peut répartir ses règles CSS sur plusieurs <style>.
  const allStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join('\n');
  const italicClasses = new Set();
  const styleRegex = /\.(c\d+)\s*\{[^}]*font-style\s*:\s*italic[^}]*\}/gi;
  let m;
  while ((m = styleRegex.exec(allStyles)) !== null) {
    italicClasses.add(m[1]);
  }

  let contenu = bodyMatch[1];
  contenu = contenu.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  contenu = contenu.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // "<p" seul matcherait aussi "<path" (balises SVG cachées dans la bannière
  // "Published using Google Docs"), donc on exige un espace ou "/>" après.
  const regexP = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi;
  const regexSpan = /<span(?:\s+class="([^"]*)")?[^>]*>([\s\S]*?)<\/span>/gi;
  const paragraphes = [];
  let match;

  while ((match = regexP.exec(contenu)) !== null) {
    // Convertit chaque span en <em> s'il porte une classe italique, sinon
    // garde juste le texte — avant de supprimer le reste des balises.
    let texte = match[1].replace(regexSpan, (_, cls, inner) => {
      const innerText = inner.replace(/<[^>]+>/g, '');
      const isItalic = (cls || '').split(/\s+/).some((c) => italicClasses.has(c));
      return isItalic ? `<em>${innerText}</em>` : innerText;
    });

    // Supprime toutes les balises restantes sauf <em>/</em> qu'on vient d'ajouter.
    texte = texte.replace(/<(?!\/?em\b)[^>]+>/g, '');
    texte = decodeEntities(texte).replace(/\s+/g, ' ').trim();
    texte = texte.replace(/<em>\s*<\/em>/g, '');

    if (texte.length > 0) {
      paragraphes.push(texte);
    }
  }

  if (paragraphes.length === 0) return null;

  // Couper le préambule si startAfter est défini
  if (startAfter) {
    const idx = paragraphes.findIndex((p) => p.includes(startAfter));
    if (idx !== -1) {
      return paragraphes.slice(idx);
    }
    // Si le marqueur n'est pas trouvé, fallback : ignorer
    // les paragraphes courts (boilerplate) et commencer au premier long
    const idxFallback = paragraphes.findIndex((p) => p.replace(/<[^>]+>/g, '').length > 80);
    if (idxFallback !== -1) return paragraphes.slice(idxFallback);
  }

  return paragraphes;
}
