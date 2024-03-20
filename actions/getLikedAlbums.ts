import { Album } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getLikedAlbums = async (): Promise<Album[]> => {
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
    const { data: likedAlbumsData, error } = await supabase
      .from('liked_albums')
      .select('album_id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!likedAlbumsData) {
      console.error("No liked albums found");
      return [];
    }

    const albumIds = likedAlbumsData.map((likedAlbum: any) => likedAlbum.album_id);

    const { data: albumsData} = await supabase
      .from('albums')
      .select('*')
      .in('id', albumIds);


    if (!albumsData) {
      console.error("No albums found for the liked albums");
      return [];
    }

    const likedAlbums: Album[] = albumsData.map((albumData: any) => ({
      id: albumData.id,
      user_id: albumData.user_id,
      title: albumData.title,
      artist: albumData.artist,
      release_year: albumData.release_year,
      genre: albumData.genre,
      image_url: albumData.image_url,
      created_at: albumData.created_at,
    }));

    return likedAlbums;
  } catch (error) {
    console.error('Error getting liked albums:', error);
    return [];
  }
};

export default getLikedAlbums;
