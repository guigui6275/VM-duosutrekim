import { getAlbumsComplets, getRevuesPourDiscographie, getPlateformes } from '@/lib/api';
import FadeIn from '@/components/FadeIn';
import DiscographieAlbums from '@/components/DiscographieAlbums';

const SLUG = process.env.NEXT_PUBLIC_ARTISTE_SLUG;

export const metadata = {
  title: 'Discographie — Duo Sutre-Kim',
};

export const revalidate = 0;

export default async function DiscographiePage() {
  const [albumsData, revuesData, plateformesData] = await Promise.all([
    getAlbumsComplets(SLUG),
    getRevuesPourDiscographie(SLUG),
    getPlateformes(),
  ]);

  const albums = albumsData.data;
  const plateformes = plateformesData.data;

  const revuesByAlbum = {};
  revuesData.data.forEach(revue => {
    revue.albums?.forEach(a => {
      if (!revuesByAlbum[a.slug]) revuesByAlbum[a.slug] = [];
      revuesByAlbum[a.slug].push(revue);
    });
  });

  return (
    <div>
      <FadeIn>
        <div style={{ padding: '40px 40px 28px', borderBottom: '0.5px solid var(--color-bordure)' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '32px', fontWeight: '400' }}>
            Discographie
          </h1>
        </div>
      </FadeIn>

      <DiscographieAlbums
        albums={albums}
        revuesByAlbum={revuesByAlbum}
        plateformes={plateformes}
      />

      {albums.length === 0 && (
        <p style={{ padding: '40px', fontSize: '14px', color: 'var(--color-texte-muted)', fontStyle: 'italic' }}>
          Aucun album pour l'instant.
        </p>
      )}
    </div>
  );
}
