import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MediaItem from '@/components/MediaItem';
import useOnPlay from '@/hooks/useOnPlay';
import { FiShuffle, FiX, FiPlay } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Album, Song } from '@/types';
import useAlbumImage from '@/hooks/useLoadAlbumImage';
import { useUser } from '@/hooks/useUser';

interface AlbumModalProps {
  album: Album;
  songs: Song[];
  onClose: () => void;
  isOpenedHome?: boolean;
}

const AlbumModal: React.FC<AlbumModalProps> = ({ album, songs, onClose, isOpenedHome = false }) => {
  const router = useRouter();
  const imageUrl = useAlbumImage(album);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);
  const [playableSongs, setPlayableSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [albumOpened, setAlbumOpened] = useState<boolean>(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState<boolean>(false);
  const [showSongRemoveConfirmation, setShowSongRemoveConfirmation] = useState<boolean>(false);
  const [songToRemove, setSongToRemove] = useState<string>('');
  const [albumToDelete, setAlbumToDelete] = useState<string>('');
  const [deletedSongs, setDeletedSongs] = useState<string[]>([]);
  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isAlbumHovered, setIsAlbumHovered] = useState<boolean>(false);
  const [isAlbumInFavourites, setIsAlbumInFavourites] = useState<boolean>(false);
  const [isAlbumInUserAlbums, setIsAlbumInUserAlbums] = useState<boolean>(false);
  
  const supabase = useSupabaseClient();
  const {user} = useUser();


  const handleCloseModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const checkAlbumInFavourites = async () => {
  try {
    // Проверяем, залогинен ли пользователь
    if (!user) {
      console.log("User is not logged in.");
      return;
    }

    // Получаем все album_id из таблицы liked_albums для текущего пользователя
    const { data: likedAlbums, error } = await supabase
      .from("liked_albums")
      .select("album_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching liked albums:", error.message);
      return;
    }

    // Проверяем, есть ли id текущего альбома среди избранных
    const albumInFavourites = likedAlbums.some(
      (likedAlbum) => likedAlbum.album_id === album.id
    );

    // Устанавливаем результат в стейт
    setIsAlbumInFavourites(albumInFavourites);
  } catch (error) {
    console.error("Error checking album in favourites:", error);
  }
};

  // Добавляем новую функцию для проверки наличия альбома в таблице albums для данного пользователя
const checkAlbumInUserAlbums = async () => {
  try {
    // Проверяем, залогинен ли пользователь
    if (!user) {
      console.log("User is not logged in.");
      return;
    }

    // Получаем все альбомы данного пользователя
    const { data: userAlbums, error } = await supabase
      .from("albums")
      .select("id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching user albums:", error.message);
      return;
    }

    // Проверяем, есть ли альбом у пользователя в таблице albums
    const albumInUserAlbums = userAlbums.some((userAlbum) => userAlbum.id === album.id);

    // Устанавливаем результат в стейт
    setIsAlbumInUserAlbums(albumInUserAlbums);
  } catch (error) {
    console.error("Error checking album in user albums:", error);
  }
};




// Вызываем функцию проверки при монтировании компонента
useEffect(() => {
  checkAlbumInUserAlbums();
}, []);


  const onPlay = useOnPlay(playableSongs);

  useEffect(() => {
    const fetchPlaylistSongs = async () => {
      try {
        const { data: albumSongsData, error: albumSongsError } = await supabase
          .from('album_songs')
          .select('song_id')
          .eq('album_id', album.id);
        if (albumSongsData) {
          const playlistSongIds = albumSongsData.map((item: any) => item.song_id);
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
        console.error('Error fetching album songs:', error);
      }
    };

    if (album.id) {
      fetchPlaylistSongs();
    }
  }, [album.id]);

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
    if (albumOpened && playableSongs.length > 0) {
      onPlay(playableSongs[currentIndex].id);
    }

    checkAlbumInFavourites();
  }, [currentIndex, playableSongs, albumOpened]);

  const handleShuffleClick = () => {
    const shuffled = [...playableSongs].sort(() => Math.random() - 0.5);
    setPlayableSongs(shuffled);
    setCurrentIndex(0);
    setIsShuffleActive(!isShuffleActive);
    setAlbumOpened(true);
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

  const handleRemoveAlbum = async () => {
    setShowRemoveConfirmation(true);
    setAlbumToDelete(album.id);
  };

  

  const handleAddAlbum = async () => {
  try {
    // Проверяем, залогинен ли пользователь
    if (!user) {
      console.log("User is not logged in.");
      return;
    }

    // Вставляем данные альбома в таблицу liked_albums
    const { data, error } = await supabase
      .from("liked_albums")
      .insert([{ user_id: user.id, album_id: album.id }]);

    if (error) {
      console.error("Error adding album to liked_albums:", error.message);
      return;
    }

    console.log("Album added to liked_albums:", data);
    onClose();
    // Теперь можно добавить дополнительную логику, например, обновить состояние или вывести уведомление об успешном добавлении
  } catch (error) {
    console.error("Error adding album to liked_albums:", error);
  }
};


 

  const handleConfirmation = async (confirmed: boolean, itemId: string) => {
    if (confirmed) {
      try {
        if (itemId === 'album') {
          // Удаление треков альбома
          await supabase
            .from('album_songs')
            .delete()
            .eq('album_id', albumToDelete);

          // Удаление альбома
          await supabase
            .from('albums')
            .delete()
            .eq('id', albumToDelete);

          onClose();
          router.refresh(); // Переход на новую страницу после удаления
        } else {
          // Удаление песни из альбома
          await supabase
            .from('album_songs')
            .delete()
            .eq('album_id', album.id)
            .eq('song_id', itemId);

          const updatedSongs = playableSongs.filter(song => song.id !== itemId);
          setPlayableSongs(updatedSongs);
          setDeletedSongs(prevDeletedSongs => [...prevDeletedSongs, itemId]);
        }
      } catch (error) {
        console.error('Error removing item from album:', error);
      }
    }
    setShowRemoveConfirmation(false);
    setShowSongRemoveConfirmation(false);
  };

  const handleUnFavouriteAlbum = async () => {
    try {
      // Проверяем, залогинен ли пользователь
      if (!user) {
        console.log("User is not logged in.");
        return;
      }

      // Удаляем запись из таблицы liked_albums
      const { error } = await supabase
        .from('liked_albums')
        .delete()
        .eq('user_id', user.id)
        .eq('album_id', album.id);

      if (error) {
        console.error("Error removing album from liked_albums:", error.message);
        return;
      }

      console.log("Album removed from liked_albums");

      // Обновляем состояние, указывая, что альбом больше не находится в избранном
      setIsAlbumInFavourites(false);

      // Обновляем роутер
      router.refresh();

      // Закрываем окно альбома
      onClose();
    } catch (error) {
      console.error("Error removing album from liked_albums:", error);
    }
  };


  const handlePlayPlaylist = () => {
    onPlay(playableSongs[0]?.id || '');
  };

  const handleAlbumHover = (hovered: boolean) => {
    setIsAlbumHovered(hovered);
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
            <p className="text-white">Are you sure you want to remove this album?</p>
            <div className="flex justify-end mt-4">
              <button className="mr-2 text-white" onClick={() => handleConfirmation(true, 'album')}>Yes</button>
              <button className="text-white" onClick={() => handleConfirmation(false, '')}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showSongRemoveConfirmation && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-20">
          <div className="bg-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded shadow-lg">
            <p className="text-white">Are you sure you want to remove this song from the album?</p>
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
                <Image src={imageUrl} alt={album.title} width={160} height={160} objectFit="cover" className="object-cover" />
                {isHovered && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiPlay className="text-white text-4xl cursor-pointer" onClick={handlePlayPlaylist} />
                  </div>
                )}
              </>
            )}
          </div>
          <div onMouseEnter={() => handleAlbumHover(true)} onMouseLeave={() => handleAlbumHover(false)} className="flex-1">
            <h2 className="text-xl font-bold">{album.title}</h2>
            <p className="text-gray-500">{album.artist}</p>
            <p className="text-gray-500">{album.release_year}</p>
            <p className="text-gray-500">{album.genre}</p>
            {isAlbumHovered && !isOpenedHome && !isAlbumInFavourites && (
              <div className="mt-2 mr-2">
                <button className="text-red-500" onClick={handleRemoveAlbum}>Remove</button>
              </div>
            )}
            {isAlbumHovered && isOpenedHome && !isAlbumInFavourites && !isAlbumInUserAlbums && (
              <div className="mt-2 mr-2">
                <button className="text-orange-500" onClick={handleAddAlbum}>Add to Favourites</button>
              </div>
            )}
            {isAlbumHovered && isAlbumInFavourites && (
              <div className="mt-2 mr-2">
                <div className="text-orange-500">In Your Favourites</div>
                <button className="text-red-500" onClick={handleUnFavouriteAlbum}>Unfavourite</button>
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
                  {(hoveredSongId === song.id && !deletedSongs.includes(song.id)) && !isOpenedHome &&(
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

export default AlbumModal;
