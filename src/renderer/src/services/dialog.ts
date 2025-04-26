
export type FileChooserDialog = {
   canceled: boolean,
   filePaths: string[],
}
export async function openFileOrDirDialog(type: "file" | "dir") : Promise<FileChooserDialog> {
   const result = await window.electron.ipcRenderer.invoke("command:openDialog", type) as FileChooserDialog;
   return result
}