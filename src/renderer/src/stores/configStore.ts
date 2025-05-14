import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'

export type configState = {
   spacePath?: string | null;
};
export type ConfigStore = {
   config: configState;
   setConfig: (config: configState) => void;
};

export const useConfigStore = create<ConfigStore>()(
   persist(
      (set) => ({
         config: {
            spacePath: "null",
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
