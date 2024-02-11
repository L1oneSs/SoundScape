"use client";

import Image from "next/image";
import useLoadImage from "@/hooks/useLoadImage";
import { Song } from "@/types";
import PlayButton from "./PlayButton";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);

  return (
    <div
      onClick={() => onClick(data.id)}
      className="
        relative 
        group 
        flex 
        flex-col 
        items-center 
        justify-center 
        rounded-md 
        overflow-hidden 
        bg-neutral-400/5 
        cursor-pointer 
        hover:bg-neutral-400/10 
        transition 
        p-2 
      "
    >
      <div
        className="
          relative 
          aspect-square 
          w-full
          h-full 
          rounded-md 
          overflow-hidden
        "
      >
        <Image
          className="object-cover"
          src={imagePath || '/images/music-placeholder.png'}
          width={120}  // Уменьшил ширину изображения
          height={120} // Уменьшил высоту изображения
          alt="Image"
        />
      </div>
      <div className="flex flex-col items-start w-full pt-2 gap-y-1">
        <p className="font-semibold text-base truncate w-full">
          {data.title}
        </p>
        <p
          className="
            text-neutral-400 
            text-sm 
            pb-2 
            w-full 
            truncate
          "
        >
          {data.author}
        </p>
      </div>
      <div
        className="
          absolute 
          bottom-2 
          right-2 
        "
      >
        <PlayButton />
      </div>
    </div>
  );
};

export default SongItem;
