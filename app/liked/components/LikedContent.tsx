"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaItem from '@/components/MediaItem';
import LikeButton from '@/components/LikeButton';
import useOnPlay from '@/hooks/useOnPlay';
import useUploadPlaylistModal from '@/hooks/useUploadPlaylist';
import useUploadAlbumModal from '@/hooks/useUploadAlbum';
import usePlaylistImage from '@/hooks/useLoadPlaylistImage';
import useAlbumImage from '@/hooks/useLoadAlbumImage';
import AlbumModal from '@/components/AlbumModal';
import PlaylistModal from '@/components/PlaylistModal';
import { Album, Playlist, Song } from '@/types';
import { useUser } from '@/hooks/useUser';
import MusicMenu from '@/components/MusicMenu';

interface LikedContentProps {
  songs: Song[];
  playlists: Playlist[];
  albums: Album[];
  playlistSongs: { playlistId: string, songs: Song[] }[];
  albumSongs: { albumId: string, songs: Song[] }[];
  likedAlbums: Album[];
}

const LikedContent: React.FC<LikedContentProps> = ({ songs, playlists, playlistSongs, albums, albumSongs, likedAlbums }) => {
  const router = useRouter();
  const { isLoading, user } = useUser();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [playlistSongsState, setPlaylistSongsState] = useState<Song[]>([]);
  const [albumSongsState, setAlbumSongsState] = useState<Song[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string>('');

  const uploadPlaylistModal = useUploadPlaylistModal();
  const uploadAlbumModal = useUploadAlbumModal();
  const onPlay = useOnPlay(songs);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  const handleCreatePlaylist = () => {
    return uploadPlaylistModal.onOpen();
  };

  const handleCreateAlbum = () => {
    return uploadAlbumModal.onOpen();
  }

  const handleShowMenu = (songId: string) => {
    if (selectedSongId === songId && showMenu ) {
      setShowMenu(false);
    } else {
      setSelectedSongId(songId);
      setShowMenu(true);
    }
  };


  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    const songs = playlistSongs.find(item => item.playlistId === playlist.id)?.songs || [];
    setPlaylistSongsState(songs);
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    const songs = albumSongs.find(item => item.albumId === album.id)?.songs || [];
    setAlbumSongsState(songs);
  };

  const handleClosePlaylistModal = () => {
    setSelectedPlaylist(null);
    setPlaylistSongsState([]);
  };

  const handleCloseAlbumModal = () => {
    setSelectedAlbum(null);
    setAlbumSongsState([]);
  };

  return (
    <div className="flex flex-col gap-y-8 p-6">
      <div className="text-lg font-semibold text-white">Playlists</div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-30 border-2 border-gray-200 hover:border-gray-400 text-gray-400 hover:text-gray-600 transition-colors mt-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCreatePlaylist}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {playlists.map((playlist) => {
          const imageUrl = usePlaylistImage(playlist);
          if (!imageUrl) {
            console.log(`Playlist ${playlist.title} does not have an image.`);
            return null;
          }

          return (
            <div key={playlist.id} className="flex flex-col items-center cursor-pointer hover:bg-neutral-800/50 rounded-lg p-2" onClick={() => handlePlaylistClick(playlist)}>
              <div className="relative w-40 h-40 overflow-hidden rounded-lg ">
                <Image
                  src={imageUrl}
                  alt={playlist.title}
                  layout="fill"
                  objectFit="cover"
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-white">{playlist.title}</p>
              <p className="text-sm text-gray-400">{playlist.description}</p>
            </div>
          );
        })}
      </div>

      <div className="text-lg font-semibold text-white">Albums</div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-100 bg-opacity-30 border-2 border-gray-200 hover:border-gray-400 text-gray-400 hover:text-gray-600 transition-colors mt-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCreateAlbum}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {albums.map((album) => {
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

      <div className="text-lg font-semibold text-white">Liked Albums</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {likedAlbums.map((album) => {
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

      <div className="text-lg font-semibold text-white">Songs</div>
      <div className="flex flex-col gap-y-4">
        {songs.map((song: any) => (
          <div key={song.id} className="flex items-center">
            <div className="flex-1">
              <MediaItem onClick={(id) => onPlay(id)} data={song} />
            </div>
            <div className="relative ml-4 mr-4">
              <button
                onClick={() => handleShowMenu(song.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 10C2 9.45 2.45 9 3 9s1 .45 1 1-.45 1-1 1zM7 10c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1zM12 10c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1z" clipRule="evenodd" />
                </svg>
              </button>
              {showMenu && selectedSongId === song.id && (
                <MusicMenu playlists={playlists} albums={albums} songId={selectedSongId} onClose={() => setShowMenu(false)} />
              )}
            </div>
            <LikeButton songId={song.id} />
          </div>
        ))}
      </div>
      {selectedPlaylist && (
        <PlaylistModal playlist={selectedPlaylist} songs={playlistSongsState} onClose={handleClosePlaylistModal} />
      )}
      {selectedAlbum && (
        <AlbumModal album={selectedAlbum} songs={albumSongsState} onClose={handleCloseAlbumModal} />
      )}
    </div>
  );
};

export default LikedContent;
