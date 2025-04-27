import { Entry } from "@/types/fileSystem.types";
import { CommandResponse } from "@/types/reponse.types";

export async function readDir(directoryPath: string) {
   return (await window.electron.ipcRenderer.invoke(
      "command:readDir",
      directoryPath,
   )) as CommandResponse<Entry[]>;
}
