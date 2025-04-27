import { Logger } from "@/lib/logger";
import { CommandResponse } from "@/types/response.types";
import { ipcMain } from "electron";

type Handler = (
   event: Electron.IpcMainInvokeEvent,
   ...args: any[]
) => Promise<any> | any;
export function createCommand(commandName: string, handler: Handler) {
   ipcMain.handle(
      commandName,
      async (event, ...args): Promise<CommandResponse<any>> => {
         try {
            return await handler(event, ...args);
         } catch (e) {
            Logger.error(`[${commandName}]`,"Internal Error: ", e);
            console.trace();
            return {
               success: false,
               errorMessage: "Internal error",
               errorCode: "internal-error",
               data: null,
            };
         }
      },
   );
}
