import { useEffect, useState } from 'react';
import { Album, Playlist } from '@/types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface MusicMenuProps {
  playlists: Playlist[];
  albums: Album[];
  songId: string;
  onClose: () => void;
}

const MusicMenu: React.FC<MusicMenuProps> = ({ playlists, albums, songId, onClose }) => {
  const supabaseClient = useSupabaseClient();
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchFilteredItems = async () => {
      try {
        const { data: existingPlaylists, error: playlistError } = await supabaseClient
          .from('playlist_songs')
          .select('playlist_id')
          .eq('song_id', songId);

        const { data: existingAlbums, error: albumError } = await supabaseClient
          .from('album_songs')
          .select('album_id')
          .eq('song_id', songId);

        if (playlistError || albumError) {
          throw playlistError || albumError;
        }

        const existingPlaylistIds = existingPlaylists.map((playlist: any) => playlist.playlist_id);
        const existingAlbumIds = existingAlbums.map((album: any) => album.album_id);

        const filteredPlaylists = playlists.filter((playlist) => !existingPlaylistIds.includes(playlist.id));
        const filteredAlbums = albums.filter((album) => !existingAlbumIds.includes(album.id));

        setFilteredPlaylists(filteredPlaylists);
        setFilteredAlbums(filteredAlbums);
      } catch (error) {
        console.error('Error checking existing playlists or albums:', error);
      }
    };

    fetchFilteredItems();
  }, [supabaseClient, playlists, albums, songId]);

  const handleItemClick = async (itemId: string, type: 'playlist' | 'album') => {
    console.log(songId); 
    await addToItem(itemId, type);
    onClose();
  };

  const addToItem = async (itemId: string, type: 'playlist' | 'album') => {
    try {
      const tableName = type === 'playlist' ? 'playlist_songs' : 'album_songs';
      const { error } = await supabaseClient
        .from(tableName)
        .insert([{ [`${type}_id`]: itemId, song_id: songId }]);

      if (error) {
        throw error;
      } else {
        console.log('Song added successfully');
      }
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  return (
    <div className="absolute top-0 right-0 mt-10 w-48 bg-neutral-800 shadow-lg rounded">
      <div className="py-1 h-32 overflow-y-auto" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {filteredPlaylists.map((playlist) => (
          <div key={playlist.id} className="px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700 cursor-pointer" onClick={() => handleItemClick(playlist.id, 'playlist')}>
            {playlist.title}
          </div>
        ))}
        {filteredAlbums.map((album) => (
          <div key={album.id} className="px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700 cursor-pointer" onClick={() => handleItemClick(album.id, 'album')}>
            {album.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicMenu;
