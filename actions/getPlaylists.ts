import { Playlist } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getPlaylists = async (): Promise<Playlist[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data } = await supabase 
    .from('playlists')
    .select('*')
    .eq('user_id', session?.user?.id)
    .order('created_at', { ascending: false })

  if (!data) return [];

  const playlists: Playlist[] = data.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    image_url: item.image_url,
    user_id: item.user_id,
    created_at: item.created_at
  }));

  return playlists;
};


export default getPlaylists;
