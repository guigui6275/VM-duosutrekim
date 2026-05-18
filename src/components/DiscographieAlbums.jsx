'use client';
import { useState } from 'react';
import FadeIn from '@/components/FadeIn';
import AlbumDetailSection from '@/components/AlbumDetailSection';

export default function DiscographieAlbums({ albums, revuesByAlbum, plateformes }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <>
      {albums.map((album, index) => (
        <FadeIn key={album.id} delay={(index % 4) + 1}>
          <AlbumDetailSection
            album={album}
            revues={revuesByAlbum[album.slug] || []}
            plateformes={plateformes}
            isActive={activeId === album.id}
            onActivate={() => setActiveId(album.id)}
          />
        </FadeIn>
      ))}
    </>
  );
}
