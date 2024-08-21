import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getLikedSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.error("User is not authenticated");
    return [];
  }

  try {
    const { data: likedSongsData, error } = await supabase
      .from('liked_songs')
      .select('song_id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!likedSongsData) {
      console.error("No liked songs found");
      return [];
    }

    const songIds = likedSongsData.map((likedSong: any) => likedSong.song_id);

    const { data: songsData} = await supabase
      .from('songs')
      .select('*')
      .in('id', songIds);


    if (!songsData) {
      console.error("No songs found for the liked songs");
      return [];
    }

    const likedSongs: Song[] = songsData.map((songData: any) => ({
      id: songData.id,
      user_id: songData.user_id,
      author: songData.author,
      title: songData.title,
      song_path: songData.song_path,
      image_path: songData.image_path
    }));

    return likedSongs;
  } catch (error) {
    console.error('Error getting liked songs:');
    return [];
  }
};

export default getLikedSongs;
