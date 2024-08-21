import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Playlist } from "@/types";

const usePlaylistImage = (playlist: Playlist) => {
  const supabaseClient = useSupabaseClient();
  
  if (!playlist) {
    return null;
  }

  const { data: imageData } = supabaseClient
    .storage
    .from('images')
    .getPublicUrl(playlist.image_url);

  return imageData?.publicUrl;
};

export default usePlaylistImage;
