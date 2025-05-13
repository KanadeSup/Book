import { Entry } from "@/types/fileSystem.types";
import { CommandResponse } from "@/types/reponse.types";

export type ReadDirRes = CommandResponse<Entry[]> & {
   errorCode?: "not-found"
}
export async function readDir(directoryPath: string) : Promise<ReadDirRes> {
   return (await window.electron.ipcRenderer.invoke(
      "command:readDir",
      directoryPath,
   )) as ReadDirRes;
}

export async function readFile(filePath: string) : Promise<string> {
   return (await window.electron.ipcRenderer.invoke(
      "command:readFile",
      filePath,
   )) as string;
}
