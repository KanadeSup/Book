import { dialog, ipcMain } from "electron";

ipcMain.handle("command:openDialog", async (_, type: "file" | "dir") => {
   if(type == "dir") {
      return await dialog.showOpenDialog({
         properties: ["openDirectory"],
      })
   }
   if(type == "file") {
      return await dialog.showOpenDialog({
         properties: ["openFile"],
      })
   }
   throw Error("Value of <type> parameter is incorrect, only 'dir' or 'file' values are accepted")
});
