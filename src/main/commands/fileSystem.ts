import { ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { CommandResponse } from "@/types/response.types";

type Entry = {
   inode: number;
   type: "directory" | "file";
   name: string;
   absolutePath: string;
   parentPath: string;
};

ipcMain.handle(
   "command:readDir",
   async (_, dirPath: string): Promise<CommandResponse<Entry[]>> => {
      try {
         const entries = fs.readdirSync(dirPath, { withFileTypes: true });
         const returnEntries: Entry[] = [];
         for (const entry of entries) {
            const absolutePath = path.join(entry.parentPath, entry.name);
            const stat = fs.statSync(absolutePath);
            returnEntries.push({
               inode: stat.ino,
               type: entry.isDirectory() ? "directory" : "file",
               name: entry.name,
               absolutePath: absolutePath,
               parentPath: entry.parentPath,
            });
         }
         return {
            success: true,
            errorMessage: null,
            data: returnEntries,
         };
      } catch (e) {
         console.error("[command:readDir]: Some thing went wrong");
         console.trace();
         return {
            success: false,
            errorMessage: "Some thing went wrong",
            data: null,
         };
      }
   },
);
