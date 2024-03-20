import Image from "next/image";
import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";

interface MediaItemProps {
  data: Song;
  onClick?: (id: string) => void;
  deleted?: boolean;
  openedFromPlaylist?: boolean; 
  openedFromLibrary?: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({
  data,
  onClick,
  deleted = false,
  openedFromPlaylist = false, 
}) => {
  const player = usePlayer();
  const imageUrl = useLoadImage(data);

  const handleClick = () => {
    if (onClick) {
      onClick(data.id);
      return true;
    }
  
    player.setId(data.id);
    return true;
  };

  return ( 
    <div
      onClick={handleClick}
      className={`flex items-center cursor-pointer pb-2 rounded-md ${deleted ? 'opacity-50 pointer-events-none' : ''} ${openedFromPlaylist ? 'hover:bg-neutral-700' : 'hover:bg-neutral-800/50'} ${openedFromPlaylist ? 'hover:bg-neutral-' : 'hover:bg-neutral-800/50'}`}
    >
      <div className="relative w-12 h-12 mr-2 rounded-md overflow-hidden">
        <Image
          src={imageUrl || "/images/music-placeholder.png"}
          alt="MediaItem"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="flex flex-col overflow-hidden">
        <p className="text-white truncate">{data.title}</p>
        <p className="text-neutral-400 text-sm truncate">{data.author}</p>
      </div>
    </div>
  );
}
 
export default MediaItem;
