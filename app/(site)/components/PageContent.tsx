"use client"

import { Album, Song } from "@/types";
import useOnPlay from "@/hooks/useOnPlay";
import SongItem from "@/components/SongItem";
import useAlbumImage from "@/hooks/useLoadAlbumImage";
import Image from 'next/image';
import { useState } from "react";
import AlbumModal from "@/components/AlbumModal";

interface PageContentProps {
  songs: Song[];
  albums: Album[];
  albumSongs: { albumId: string, songs: Song[] }[];
}

const PageContent: React.FC<PageContentProps> = ({
  songs,
  albums,
  albumSongs,
}) => {
  const onPlay = useOnPlay(songs);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumSongsState, setAlbumSongsState] = useState<Song[]>([]);

  const handleCloseAlbumModal = () => {
    setSelectedAlbum(null);
    setAlbumSongsState([]);
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    const songs = albumSongs.find(item => item.albumId === album.id)?.songs || [];
    setAlbumSongsState(songs);
  };

  if (songs.length === 0 && albums.length === 0) {
    return (
      <div className="mt-4 text-neutral-400">
        No songs available.
      </div>
    )
  }

  return ( 
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {albums.map((album) => {
          console.log(album.title)
          const imageUrl = useAlbumImage(album);
          if (!imageUrl) {
            console.log(`Album ${album.title} does not have an image.`);
            return null;
          }

          return (
            <div key={album.id} className="flex flex-col items-center cursor-pointer hover:bg-neutral-800/50 rounded-lg p-2" onClick={() => handleAlbumClick(album)}>
              <div className="relative w-40 h-40 overflow-hidden rounded-lg ">
                <Image
                  src={imageUrl}
                  alt={album.title}
                  layout="fill"
                  objectFit="cover"
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-white">{album.title}</p>
              <p className="text-sm text-gray-400">{album.artist}</p>
              <p className="text-sm text-gray-400">{album.release_year}</p>
              <p className="text-sm text-gray-400">{album.genre}</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-bold text-white mt-8 mb-4">Songs</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-8 mt-4">
        {songs.map((item) => (
          <SongItem 
            onClick={(id: string) => onPlay(id)} 
            key={item.id} 
            data={item}
          />
        ))}
      </div>
      
      {selectedAlbum && (
        <AlbumModal album={selectedAlbum} songs={albumSongsState} onClose={handleCloseAlbumModal} isOpenedHome={true} />
      )}
    </div>
  );
}

export default PageContent;
