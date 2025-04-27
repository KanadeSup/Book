import { BaseResponse } from "@/types/reponse.types";
import { readDir } from "./fileSystem";
import { Book } from "@/types/book.types";

export type GetBookReponse = BaseResponse<Book[]>;
export async function getBooks(directoryPath: string): Promise<GetBookReponse> {
   const result = await readDir(directoryPath);
   if (!result.success || !result.data) {
      return {
         success: false,
         errorMessage: result.errorMessage,
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
      errorMessage: null,
      data: returnResult,
   };
}
