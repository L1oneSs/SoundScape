import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { BsPauseFill, BsPlayFill, BsShuffle, BsArrowRepeat } from 'react-icons/bs';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { AiFillStepBackward, AiFillStepForward } from 'react-icons/ai';
import useSound from 'use-sound';
import { Song } from '@/types';
import usePlayer from '@/hooks/usePlayer';
import LikeButton from './LikeButton';
import MediaItem from './MediaItem';
import Slider from './Slider';

interface GeniusSongData {
  title: string;
  lyrics: string;
  url: string;
}

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currTime, setCurrTime] = useState({ min: 0, sec: 0 });
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const [play, { pause, sound }] = useSound(songUrl, {
    volume: volume,
    onplay: () => setIsPlaying(true),
    onload: (): void => {
      if (sound) {
        setDuration(sound.duration());
      }
    },
    onend: () => {
      setIsPlaying(false);
      if (player.isLoop) {
        play();
      } else {
        onPlayNext();
      }
    },
    onpause: () => setIsPlaying(false),
    format: ['mp3'],
  });

  useEffect(() => {
    if (sound) {
      sound.play();
  
      
      return () => {
        sound.unload();
      };
    }
  }, [sound]);
  

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound) {
        const currentSec = Math.floor(sound.seek());
        const min = Math.floor(currentSec / 60);
        const sec = Math.floor(currentSec % 60);
        setCurrTime({ min, sec });
        setCurrentTime(currentSec);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const onPlayNext = () => {
    if (player.isShuffle) {
      const randomIndex = Math.floor(Math.random() * (player.ids.length || 0));
      const nextSongId = player.ids[randomIndex];
      player.setId(nextSongId);
    } else {
      const currentIndex = player.ids.findIndex((id) => id === player.activeId);
      const nextSong = player.ids[currentIndex + 1];

      if (!nextSong) {
        if (player.isLoop) {
          play();
        } else {
          return player.setId(player.ids[0]);
        }
      }

      player.setId(nextSong);
    }
  };

  const onPlayPrevious = () => {
    if (player.isShuffle) {
      const randomIndex = Math.floor(Math.random() * (player.ids.length || 0));
      const previousSongId = player.ids[randomIndex];
      player.setId(previousSongId);
    } else {
      const currentIndex = player.ids.findIndex((id) => id === player.activeId);
      const previousSong = player.ids[currentIndex - 1];

      if (!previousSong) {
        if (player.isLoop) {
          play();
        } else {
          return player.setId(player.ids[player.ids.length - 1]);
        }
      }

      player.setId(previousSong);
    }
  };

  const toggleMute = () => {
    setVolume((prevVolume) => (prevVolume === 0 ? 1 : 0));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value, 10);
    sound?.seek(newTime);
    setCurrentTime(newTime);
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [geniusSongData, setGeniusSongData] = useState<GeniusSongData | null>(null);

  const openModal = async () => {
    try {
      const { title, author } = song;
      const artist = encodeURIComponent(author);
      const songTitle = encodeURIComponent(title);

      const response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${songTitle}`);
      const lyricsData = await response.json();

      setGeniusSongData({
        title: song.title,
        lyrics: lyricsData.lyrics || '',
        url: '',
      });

      setModalIsOpen(true);
    } catch (error) {
      console.error('Ошибка при получении текста песни:', error);
    }
  };

  const closeModal = () => {
    setGeniusSongData(null);
    setModalIsOpen(false);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full justify-end">
      <div className="flex w-full gap-x-6">
        <div className="flex items-center gap-x-2">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
        <button onClick={openModal} className="cursor-pointer text-neutral-400 hover:text-orange-400">
          Lyrics
        </button>
      </div>

      <div className="flex md:flex-col md:items-center md:justify-center md:col-span-2 lg:col-span-1 gap-y-2">
        <div className="hidden md:flex w-full justify-center items-center gap-x-2">
          <AiFillStepBackward onClick={onPlayPrevious} size={25} className="text-neutral-400 cursor-pointer hover:text-white transition" />
          <div onClick={handlePlay} className="flex items-center justify-center h-8 w-8 rounded-full bg-white p-1 cursor-pointer">
            <Icon size={30} className="text-black" />
          </div>
          <AiFillStepForward onClick={onPlayNext} size={25} className="text-neutral-400 cursor-pointer hover:text-white transition" />
        </div>

        <div className="flex items-center gap-x-2 w-full relative">
          <input
            type="range"
            min="0"
            max={sound ? sound.duration() : 0}
            value={currentTime}
            onChange={handleSliderChange}
            className="w-full h-2 rounded-md overflow-hidden appearance-none bg-neutral-200"
            style={{
              background: `linear-gradient(to right, #F97216, #F97216 ${(currentTime / (sound ? sound.duration() : 1)) * 100}%, #cbd5e0 ${(currentTime / (sound ? sound.duration() : 1)) * 100}%, #cbd5e0 100%)`,
            }}
          />
          <div className="flex-shrink-0 ml-2 text-xs text-orange-400">
            {`${currTime.min}:${currTime.sec} / ${Math.floor(sound ? sound.duration() / 60 : 0)}:${Math.floor(sound ? sound.duration() % 60 : 0)}`}
          </div>
        </div>
      </div>

      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div onClick={handlePlay} className="h-10 w-10 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer">
          <Icon size={30} className="text-black" />
        </div>
      </div>

      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[120px]">
          <button
              onClick={player.toggleShuffle}
              className={`cursor-pointer ${
                player.isShuffle
                  ? 'text-orange-500'
                  : 'text-neutral-400'
              }`}
            >
              <BsShuffle size={15} />
            </button>
            <BsArrowRepeat
              size={40}
              onClick={player.toggleLoop}
              className={`cursor-pointer ${player.isLoop ? 'text-orange-400' : 'text-neutral-400'}`}
            />
            <VolumeIcon onClick={toggleMute} className="cursor-pointer" size={40} />
            <Slider value={volume} onChange={(value) => setVolume(value)} />
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            background: 'rgba(51, 51, 51, 1)', 
            color: 'white',
            padding: '6px',
            borderRadius: '10px',
            margin: 'auto',
            maxWidth: '500px', 
            maxHeight: '500px'
          },
          overlay: {
            background: 'rgba(51, 51, 51, 0.9)' 
          }
        }}
      >
        <div>
          {geniusSongData ? (
            <>
              <h2 className='mb-2 text-lg'>{geniusSongData.title}</h2>
              {geniusSongData.lyrics ? (
                <p className="whitespace-pre-line mb-4 text-base">
                  {geniusSongData.lyrics
                    .split('\n')
                    .slice(1)
                    .join('\n')}
                </p>
              ) : (
                <p>No Lyrics available</p>
              )}
            </>
          ) : (
            <p>No Song Data available</p>
          )}
        </div>
      </Modal>




    </div>
  );
};

export default PlayerContent;