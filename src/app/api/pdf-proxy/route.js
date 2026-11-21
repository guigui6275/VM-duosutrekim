const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Strapi envoie X-Frame-Options/CSP frame-ancestors qui bloquent l'affichage d'un PDF
// dans un <iframe> cross-origin (ce site tourne sur un port différent). On reproxie
// donc le fichier en même origine plutôt que d'affaiblir la sécurité de Strapi.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.toLowerCase().endsWith('.pdf')) {
    return Response.json({ error: 'URL invalide.' }, { status: 400 });
  }
  // Le champ `url` renvoyé par Strapi est relatif (ex: /uploads/xxx.pdf) —
  // ici, côté serveur, il faut le résoudre explicitement vers Strapi.
  const fullUrl = url.startsWith('/uploads/') ? `${STRAPI_URL}${url}` : url;
  if (!fullUrl.startsWith(`${STRAPI_URL}/uploads/`)) {
    return Response.json({ error: 'URL invalide.' }, { status: 400 });
  }

  // Relaie l'en-tête Range : Strapi sait déjà servir du contenu partiel
  // (confirmé : 206 + Content-Range sur /uploads/). Sans ça, pdf.js doit
  // télécharger le PDF entier juste pour afficher une vignette ou la 1ère
  // page — très sensible sur des livrets de plusieurs Mo.
  const range = request.headers.get('range');
  const res = await fetch(fullUrl, range ? { headers: { Range: range } } : undefined);
  if (!res.ok && res.status !== 206) {
    return Response.json({ error: 'Document introuvable.' }, { status: res.status });
  }

  // Le nom de fichier Strapi est haché par son contenu (jamais réécrit en
  // place) — immutable : le navigateur peut mettre en cache indéfiniment,
  // ce qui permet au préchargement (voir AlbumLivrets.jsx) d'être réellement
  // réutilisé par pdf.js au clic plutôt que retéléchargé.
  const headers = {
    'Content-Type': 'application/pdf',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
  const contentRange = res.headers.get('content-range');
  const contentLength = res.headers.get('content-length');
  const etag = res.headers.get('etag');
  const lastModified = res.headers.get('last-modified');
  if (contentRange) headers['Content-Range'] = contentRange;
  if (contentLength) headers['Content-Length'] = contentLength;
  if (etag) headers['ETag'] = etag;
  if (lastModified) headers['Last-Modified'] = lastModified;

  return new Response(res.body, { status: res.status, headers });
}
