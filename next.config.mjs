/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['strapi-sonarti.local'],
  // Fait transiter médias et appels API Strapi par le même port que le site :
  // le navigateur n'a plus besoin d'atteindre 127.0.0.1:1337 directement
  // (impossible via un tunnel SSH distant sans tunneler ce port en plus).
  // Next.js proxifie en interne vers Strapi, qui tourne sur la même machine.
  async rewrites() {
    return [
      { source: '/uploads/:path*', destination: 'http://127.0.0.1:1337/uploads/:path*' },
      { source: '/api/:path*', destination: 'http://127.0.0.1:1337/api/:path*' },
    ];
  },
};

export default nextConfig;
