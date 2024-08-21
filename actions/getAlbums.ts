import { Album, Playlist } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getAlbums = async (): Promise<Album[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data } = await supabase 
    .from('albums')
    .select('*')
    .eq('user_id', session?.user?.id)
    .order('created_at', { ascending: false })

  if (!data) return [];

  const albums: Album[] = data.map((item: any) => ({
    id: item.id,
    title: item.title,
    release_year: item.release_year,
    genre: item.genre,
    artist: item.artist,
    image_url: item.image_url,
    user_id: item.user_id,
    created_at: item.created_at
  }));

  return albums
};


export default getAlbums;
