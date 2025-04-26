import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'

export type configState = {
   spacePath?: string | null;
};
type configStore = {
   config: configState;
   setConfig: (config: configState) => void;
};

export const useConfigStore = create<configStore>()(
   persist(
      (set) => ({
         config: {
            spacePath: null,
         },
         setConfig: (config) => {
            set(() => ({ config: config }));
         },
      }),
      {
         name: 'config-storage',
         storage: createJSONStorage(() => localStorage),
      }
   )
);
