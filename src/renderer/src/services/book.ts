import { CommandResponse } from "@/types/reponse.types";
import { readDir, ReadDirRes } from "./fileSystem";
import { Book } from "@/types/book.types";

export async function getBooks(directoryPath: string): Promise<CommandResponse<Book[]>> {
   const result: ReadDirRes = await readDir(directoryPath);
   if (!result.success) {
      return {
         success: false,
         errorMessage: result.errorMessage,
         data: null,
      };
   }
   const entries = result.data;
   const returnResult: Book[] = [];
   for (const entry of entries) {
      if(!entry.name.endsWith(".pdf")) continue;
      returnResult.push({
         id: entry.inode,
         title: entry.name,
         filePath: entry.absolutePath,
      });
   }
   return {
      success: true,
      data: returnResult,
   };
}
