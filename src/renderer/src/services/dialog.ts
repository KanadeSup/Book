import { CommandResponse } from "@/types/reponse.types";

export type FileChooserDialog = {
   canceled: boolean;
   filePaths: string[];
};
export async function openFileOrDirDialog(
   type: "file" | "dir",
): Promise<CommandResponse<FileChooserDialog>> {
   const result = (await window.electron.ipcRenderer.invoke(
      "command:openDialog",
      type,
   )) as CommandResponse<FileChooserDialog>;
   return result;
}
