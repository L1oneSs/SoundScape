import Image from "next/image";
import Header from "@/components/Header";
import LikedContent from "./components/LikedContent";
import getPlaylists from "@/actions/getPlaylists"; 
import getLikedSongs from "@/actions/getLikedSongs";
import getSongsForPlaylist from "@/actions/getSongsForPlaylist"; 
import getAlbums from "@/actions/getAlbums";
import getSongsForAlbum from "@/actions/getSongsForAlbum";
import getLikedAlbums from "@/actions/getLikedAlbums";

export const revalidate = 0;

const Liked = async () => {
  const songs = await getLikedSongs(); 
  const likedAlbums = await getLikedAlbums();
  const playlists = await getPlaylists(); 
  const albums = await getAlbums();

  console.log(songs)
  console.log("HELLO")

  const playlistSongs = await Promise.all(playlists.map(async (playlist) => {
    return {
      playlistId: playlist.id,
      songs: await getSongsForPlaylist(playlist.id)
    };
  }));

  const albumSongs = await Promise.all(albums.map(async (album) => {
    return {
      albumId: album.id,
      songs: await getSongsForAlbum(album.id)
    };
  }));

  return (
    <div 
      className="
        bg-neutral-900 
        rounded-lg 
        h-full 
        w-full 
        overflow-hidden 
        overflow-y-auto
      "
    >
      <Header>
        <div className="mt-20">
          <div 
            className="
              flex 
              flex-col 
              md:flex-row 
              items-center 
              gap-x-5
            "
          >
            <div className="relative h-32 w-32 lg:h-44 lg:w-44">
              <Image
                className="object-cover"
                fill
                src="/images/liked2.png"
                alt="Playlist"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">
                Playlist
              </p>
              <h1 
                className="
                  text-white 
                  text-4xl 
                  sm:text-5xl 
                  lg:text-7xl 
                  font-bold
                "
              >
                Favourites
              </h1>
            </div>
          </div>
        </div>
      </Header>
      <LikedContent songs={songs} playlists={playlists} playlistSongs={playlistSongs} albums={albums} albumSongs={albumSongs} likedAlbums={likedAlbums} /> {/* Передача песен и плейлистов в компонент LikedContent */}
    </div>
  );
}

export default Liked;
