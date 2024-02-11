// usePlayer.ts

import { create } from 'zustand';

interface PlayerStore {
  ids: string[];
  activeId?: string;
  isShuffle: boolean;
  isLoop: boolean; // Новое состояние для зацикливания трека
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  toggleShuffle: () => void;
  toggleLoop: () => void; // Новая функция для переключения зацикливания
  reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  isShuffle: false,
  isLoop: false, // Инициализация нового состояния
  setId: (id: string) => set({ activeId: id }),
  setIds: (ids: string[]) => set({ ids }),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleLoop: () => set((state) => ({ isLoop: !state.isLoop })), // Реализация новой функции
  reset: () => set({ ids: [], activeId: undefined, isShuffle: false, isLoop: false }),
}));

export default usePlayer;
