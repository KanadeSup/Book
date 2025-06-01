import { CommandResponse } from "@/types/reponse.types";

export type TranslateDefinition = {
   word: string;
   definition: string;
   examples: string[];
   vnTranslations: string[];
};
export const translateText = async (text: string) => {
   const result = await window.electron.ipcRenderer.invoke(
      "command:translateText",
      text,
   );
   return result as CommandResponse<TranslateDefinition>;
};
