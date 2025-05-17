import { CommandResponse } from "@/types/reponse.types";

export const translateText = async (text: string) => {
   const result = await window.electron.ipcRenderer.invoke(
      "command:translateText",
      text,
   );
   return result as CommandResponse<{
      word: string;
      definition: string;
      examples: string[];
      vnTranslations: string[];
   }>;
};
