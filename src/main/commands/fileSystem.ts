import fs from "fs";
import path from "path";
import { CommandResponse } from "@/types/response.types";
import { createCommand } from "./base";

type Entry = {
   inode: number;
   type: "directory" | "file";
   name: string;
   absolutePath: string;
   parentPath: string;
};

createCommand(
   "command:readDir",
   async (_, dirPath: string): Promise<CommandResponse<Entry[]>> => {
      if (!fs.existsSync(dirPath) || !isDir(dirPath)) {
         return {
            success: false,
            errorMessage: "Directory is not found",
            errorCode: "not-found",
            data: null,
         };
      }
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
         data: returnEntries,
      };
   },
);

createCommand(
   "command:readFile",
   async (_, filePath: string) => {
      const data = await fs.readFileSync(filePath);
      return data;
   }
)

function isDir(path: string) {
   const stat = fs.statSync(path);
   return stat.isDirectory();
}
