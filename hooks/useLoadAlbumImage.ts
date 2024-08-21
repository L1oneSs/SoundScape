import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Album } from "@/types";

const useAlbumImage = (album: Album) => {
  const supabaseClient = useSupabaseClient();
  
  if (!album) {
    return null;
  }

  const { data: imageData } = supabaseClient
    .storage
    .from('images')
    .getPublicUrl(album.image_url);

  return imageData?.publicUrl;
};

export default useAlbumImage;
