import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaItem from '@/components/MediaItem';
import useOnPlay from '@/hooks/useOnPlay';
import { FiShuffle, FiX, FiPlay } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Playlist, Song } from '@/types';
import useplaylistImage from '@/hooks/useLoadPlaylistImage';

interface PlaylistModalProps {
  playlist: Playlist;
  songs: Song[];
  onClose: () => void;
}

const playlistModal: React.FC<PlaylistModalProps> = ({ playlist, songs, onClose }) => {
  const router = useRouter();
  const imageUrl = useplaylistImage(playlist);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);
  const [playableSongs, setPlayableSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playlistOpened, setplaylistOpened] = useState<boolean>(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState<boolean>(false);
  const [showSongRemoveConfirmation, setShowSongRemoveConfirmation] = useState<boolean>(false);
  const [songToRemove, setSongToRemove] = useState<string>('');
  const [playlistToDelete, setplaylistToDelete] = useState<string>('');
  const [deletedSongs, setDeletedSongs] = useState<string[]>([]);
  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isplaylistHovered, setIsplaylistHovered] = useState<boolean>(false);
  const supabase = useSupabaseClient();

  const handleCloseModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const onPlay = useOnPlay(playableSongs);

  useEffect(() => {
    const fetchPlaylistSongs = async () => {
      try {
        const { data: playlistSongsData, error: playlistSongsError } = await supabase
          .from('playlist_songs')
          .select('song_id')
          .eq('playlist_id', playlist.id);
        if (playlistSongsData) {
          const playlistSongIds = playlistSongsData.map((item: any) => item.song_id);
          const { data: newSongsData, error: newSongsError } = await supabase
            .from('songs')
            .select('*')
            .in('id', playlistSongIds);
          if (newSongsData) {
            const newSongs: Song[] = newSongsData.map((songData: any) => ({
              id: songData.id,
              user_id: songData.user_id,
              author: songData.author,
              title: songData.title,
              song_path: songData.song_path,
              image_path: songData.image_path
            }));
            setPlayableSongs(newSongs);
          }
        }
      } catch (error) {
        console.error('Error fetching playlist songs:', error);
      }
    };

    if (playlist.id) {
      fetchPlaylistSongs();
    }
  }, [playlist.id]);

  useEffect(() => {
    if (playableSongs.length > 0) {
      console.log('Loaded songs:', playableSongs.map(song => song.title));
    }
  }, [playableSongs]);

  useEffect(() => {
    if (isShuffleActive) {
      const shuffled = [...playableSongs].sort(() => Math.random() - 0.5);
      setShuffledSongs(shuffled);
      setCurrentIndex(0);
    } else {
      setShuffledSongs([]);
      setCurrentIndex(0);
    }
  }, [isShuffleActive, playableSongs]);

  useEffect(() => {
    if (playlistOpened && playableSongs.length > 0) {
      onPlay(playableSongs[currentIndex].id);
    }
  }, [currentIndex, playableSongs, playlistOpened]);

  const handleShuffleClick = () => {
    const shuffled = [...playableSongs].sort(() => Math.random() - 0.5);
    setPlayableSongs(shuffled);
    setCurrentIndex(0);
    setIsShuffleActive(!isShuffleActive);
    setplaylistOpened(true);
    //setPlayableSongs([...songs]); // Обновление списка воспроизведения при включении шаффла
  };

  const handleNextSong = () => {
    if (isShuffleActive && shuffledSongs.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledSongs.length);
    } else if (!isShuffleActive && playableSongs.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % playableSongs.length);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    setShowSongRemoveConfirmation(true);
    setSongToRemove(songId);
  };

  const handleRemoveplaylist = async () => {
    setShowRemoveConfirmation(true);
    setplaylistToDelete(playlist.id);
  };

  const handleConfirmation = async (confirmed: boolean, itemId: string) => {
    if (confirmed) {
      try {
        if (itemId === 'playlist') {
          // Удаление треков альбома
          await supabase
            .from('playlist_songs')
            .delete()
            .eq('playlist_id', playlistToDelete);

          // Удаление альбома
          await supabase
            .from('playlists')
            .delete()
            .eq('id', playlistToDelete);

          onClose();
          router.refresh(); 
        } else {
          await supabase
            .from('playlist_songs')
            .delete()
            .eq('playlist_id', playlist.id)
            .eq('song_id', itemId);

          const updatedSongs = playableSongs.filter(song => song.id !== itemId);
          setPlayableSongs(updatedSongs);
          setDeletedSongs(prevDeletedSongs => [...prevDeletedSongs, itemId]);
        }
      } catch (error) {
        console.error('Error removing item from playlist:', error);
      }
    }
    setShowRemoveConfirmation(false);
    setShowSongRemoveConfirmation(false);
  };

  const handlePlayPlaylist = () => {
    onPlay(playableSongs[0]?.id || '');
  };

  const handleplaylistHover = (hovered: boolean) => {
    setIsplaylistHovered(hovered);
  };

  const handleSongItemClick = (songId: string) => {
  if (!deletedSongs.includes(songId)) {
    onPlay(songId);
  }
};

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-neutral-800 bg-opacity-50" onClick={handleCloseModal}>
      {showRemoveConfirmation && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-20">
          <div className="bg-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded shadow-lg">
            <p className="text-white">Are you sure you want to remove this playlist?</p>
            <div className="flex justify-end mt-4">
              <button className="mr-2 text-white" onClick={() => handleConfirmation(true, 'playlist')}>Yes</button>
              <button className="text-white" onClick={() => handleConfirmation(false, '')}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showSongRemoveConfirmation && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-20">
          <div className="bg-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded shadow-lg">
            <p className="text-white">Are you sure you want to remove this song from the playlist?</p>
            <div className="flex justify-end mt-4">
              <button className="mr-2 text-white" onClick={() => handleConfirmation(true, songToRemove)}>Yes</button>
              <button className="text-white" onClick={() => handleConfirmation(false, '')}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-neutral-800 rounded-lg p-8 w-96 relative">
        <div className="flex gap-4 items-center mb-4">
          <div className="w-40 h-40 overflow-hidden rounded-lg relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {imageUrl && (
              <>
                <Image src={imageUrl} alt={playlist.title} width={160} height={160} objectFit="cover" className="object-cover" />
                {isHovered && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiPlay className="text-white text-4xl cursor-pointer" onClick={handlePlayPlaylist} />
                  </div>
                )}
              </>
            )}
          </div>
          <div onMouseEnter={() => handleplaylistHover(true)} onMouseLeave={() => handleplaylistHover(false)} className="flex-1">
            <h2 className="text-xl font-bold">{playlist.title}</h2>
            <p className="text-gray-500">{playlist.description}</p>
            {isplaylistHovered && (
              <div className="mt-2 mr-2">
                <button className="text-red-500" onClick={handleRemoveplaylist}>Remove</button>
              </div>
            )}
          </div>
        </div>
        <hr className="border-t border-gray-300 w-full my-4" />
        <div className="flex items-center justify-center w-full cursor-pointer hover:bg-neutral-700 p-2 rounded-lg mb-2" onClick={handleShuffleClick}>
          <FiShuffle className={`text-white mr-2 ${isShuffleActive ? 'text-green-500' : ''}`} />
          <span className="text-white">Shuffle</span>
        </div>
        <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 8px' }}>
          <ul>
            {playableSongs.map((song) => (
              <li key={song.id} className="mb-2 flex justify-between items-center" onClick={() => handleSongItemClick(song.id)}>
                <div className="flex flex-auto items-center hover:bg-neutral-700 p-2 rounded-lg relative" onMouseEnter={() => setHoveredSongId(song.id)} onMouseLeave={() => setHoveredSongId(null)}>
                  <MediaItem data={song} deleted={deletedSongs.includes(song.id)} openedFromPlaylist={true} />
                  {(hoveredSongId === song.id && !deletedSongs.includes(song.id)) && (
                    <FiX className={`absolute right-2 top-1/2 -translate-y-1/2 text-neutral-300 opacity-0 cursor-pointer ${hoveredSongId === song.id && !deletedSongs.includes(song.id) ? 'opacity-100' : ''}`} onClick={() => handleRemoveSong(song.id)} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default playlistModal;
