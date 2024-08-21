import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Song } from "@/types";

const getSongsForPlaylist = async (playlistId: string): Promise<Song[]> => {
  const { cookies } = await import("next/headers");
  
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: playlistSongs, error: playlistSongsError } = await supabase
    .from('playlist_songs')
    .select('song_id')
    .eq('playlist_id', playlistId);

  if (playlistSongsError) {
    console.error("Error fetching playlist songs:", playlistSongsError.message);
    return [];
  }

  const songIds = playlistSongs.map((playlistSong: any) => playlistSong.song_id);

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

export default getSongsForPlaylist;