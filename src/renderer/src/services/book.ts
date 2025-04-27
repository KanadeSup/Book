import { CommandResponse } from "@/types/reponse.types";
import { readDir, ReadDirRes } from "./fileSystem";
import { Book } from "@/types/book.types";

export type GetBookReponse = CommandResponse<Book[]> & {
   errorCode?: "invalid-path";
};
export async function getBooks(directoryPath: string): Promise<GetBookReponse> {
   const result: ReadDirRes = await readDir(directoryPath);
   if (!result.success) {
      const errorCode =
         result.errorCode === "not-found" ? "invalid-path" : undefined;
      return {
         success: false,
         errorMessage: result.errorMessage,
         errorCode: errorCode,
         data: null,
      };
   }
   const entries = result.data;
   const returnResult: Book[] = [];
   for (const entry of entries) {
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
