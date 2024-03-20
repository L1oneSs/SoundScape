import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Song } from "@/types";

const getSongsForAlbum = async (albumId: string): Promise<Song[]> => {
  const { cookies } = await import("next/headers");
  
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: albumSongs, error: albumSongsError } = await supabase
    .from('album_songs')
    .select('song_id')
    .eq('album_id', albumId);

  if (albumSongsError) {
    console.error("Error fetching album songs:", albumSongsError.message);
    return [];
  }

  const songIds = albumSongs.map((albumSong: any) => albumSong.song_id);

  const { data: songs, error: songsError } = await supabase
    .from('songs')
    .select('*')
    .in('id', songIds)
    .order('created_at', { ascending: false });

  if (songsError) {
    console.error("Error fetching songs:", songsError.message);
    return [];
  }

  const formattedSongs: Song[] = songs.map((song: any) => ({
    id: song.id,
    user_id: song.user_id,
    author: song.author,
    title: song.title,
    song_path: song.song_path,
    image_path: song.image_path
  }));

  return formattedSongs;
};

export default getSongsForAlbum;