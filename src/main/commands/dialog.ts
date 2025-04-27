import { CommandResponse } from "@/types/response.types";
import { dialog } from "electron";
import { createCommand } from "./base";

createCommand(
   "command:openDialog",
   async (
      _,
      type: "file" | "dir",
   ): Promise<CommandResponse<Electron.OpenDialogReturnValue>> => {
      let dialogRes: Electron.OpenDialogReturnValue | null = null;
      if (type == "dir") {
         dialogRes = await dialog.showOpenDialog({
            properties: ["openDirectory"],
         });
      } else if (type == "file") {
         dialogRes = await dialog.showOpenDialog({
            properties: ["openFile"],
         });
      } else {
         const errorMessage =
            "Value of <type> parameter is incorrect, only 'dir' or 'file' values are accepted";
         return {
            success: false,
            errorMessage: errorMessage,
            data: null,
         };
      }
      return {
         success: true,
         data: dialogRes,
      };
   },
);
