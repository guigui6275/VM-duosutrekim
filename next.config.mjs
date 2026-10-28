/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['strapi-sonarti.local'],
  // Fait transiter médias et appels API Strapi par le même port que le site :
  // le navigateur n'a plus besoin d'atteindre 127.0.0.1:1337 directement
  // (impossible via un tunnel SSH distant sans tunneler ce port en plus).
  // Next.js proxifie en interne vers Strapi, qui tourne sur la même machine.
  // Phase `fallback` (pas le tableau par défaut = `afterFiles`) : un tableau
  // simple s'exécute APRÈS les routes statiques mais AVANT les routes
  // dynamiques ([documentId], [id]), ce qui interceptait nos propres routes
  // admin dynamiques et les renvoyait par erreur vers Strapi (404/405).
  // `fallback` n'agit qu'en dernier recours, une fois le filesystem épuisé.
  async rewrites() {
    return {
      fallback: [
        { source: '/uploads/:path*', destination: 'http://127.0.0.1:1337/uploads/:path*' },
        { source: '/api/:path*', destination: 'http://127.0.0.1:1337/api/:path*' },
      ],
    };
  },
};

export default nextConfig;
