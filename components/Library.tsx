import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Song } from "@/types";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import useOnPlay from '@/hooks/useOnPlay';
import MediaItem from './MediaItem';
import { useUser } from '@/hooks/useUser';
import useUploadModal from '@/hooks/useUploadModal';
import useAuthModal from '@/hooks/useAuthModal';
import useSubscribeModal from '@/hooks/useSubscribeModal';
import { AiOutlinePlus } from "react-icons/ai";
import { useRouter } from 'next/navigation';
import usePlayer from '@/hooks/usePlayer';
import { toast } from "react-hot-toast";

interface LibraryProps {
  songs: Song[];
}

const Library: React.FC<LibraryProps> = ({ songs }) => {
  const supabase = useSupabaseClient();
  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null);
  const [showSongRemoveConfirmation, setShowSongRemoveConfirmation] = useState<boolean>(false);
  const [songToRemove, setSongToRemove] = useState<string>('');
  const { user, subscription } = useUser();
  const uploadModal = useUploadModal();
  const authModal = useAuthModal();
  const subscribeModal = useSubscribeModal();
  const router = useRouter();
  const [songsForPlay, setSongsForPlay] = useState<Song[]>(songs);
  const player = usePlayer();

  useEffect(() => {
    setSongsForPlay(songs);
  }, [songs]);

  const onPlay = useOnPlay(songsForPlay);

  const handleRemoveSong = (songId: string) => {
    setSongToRemove(songId);
    setShowSongRemoveConfirmation(true);
  }

  const onRemoveSong = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);
      
      if (error) {
        throw error;
      }

      const updatedSongs = songsForPlay.filter(song => song.id !== songId);
      setSongsForPlay(updatedSongs);
      console.log(`Song with ID ${songId} removed successfully.`);

      toast.success("Song was removed successfully!")

      player.reset(); 
      player.setIds(updatedSongs.map((song) => song.id));

    } catch (error) {
      console.error('Error removing song', error);
    }
    setShowSongRemoveConfirmation(false);
  }

  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }

    if (!subscription) {
      return subscribeModal.onOpen();
    }

    return uploadModal.onOpen();
  }

  const handleConfirmation = async (confirmed: boolean, songId: string) => {
    if (confirmed) {
      await onRemoveSong(songId);
    } else {
      setShowSongRemoveConfirmation(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="inline-flex items-center gap-x-2">
          <p className="text-neutral-400 font-medium text-md">Your Uploaded</p>
        </div>
        <AiOutlinePlus
          onClick={onClick}
          size={20}
          className="
            text-neutral-400
            cursor-pointer
            hover:text-white
            transition
          "
        />
      </div>
      <div className="flex flex-col gap-y-2 mt-4 px-3">
        {songsForPlay.map((item) => (
          <div key={item.id} className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-neutral-800 hover:opacity-90" onMouseEnter={() => setHoveredSongId(item.id)} onMouseLeave={() => setHoveredSongId(null)}>
            <MediaItem onClick={(id: string) => onPlay(id)} data={item} />
            {hoveredSongId === item.id && (
              <FiX
                className="text-neutral-300 cursor-pointer"
                onClick={() => handleRemoveSong(item.id)}
              />
            )}
          </div>
        ))}
      </div>
      {showSongRemoveConfirmation && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-20">
          <div className="bg-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded shadow-lg">
            <p className="text-white">Are you sure you want to remove this song?</p>
            <div className="flex justify-end mt-4">
              <button className="mr-2 text-white" onClick={() => handleConfirmation(true, songToRemove)}>Yes</button>
              <button className="text-white" onClick={() => handleConfirmation(false, '')}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;
