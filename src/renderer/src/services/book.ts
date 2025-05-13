import { CommandResponse } from "@/types/reponse.types";
import { readDir, ReadDirRes, readFile } from "./fileSystem";
import { Book, BookPdfMetaData } from "@/types/book.types";
import { pdfjs } from "@/lib/pdfjs";

export async function getBooks(
   directoryPath: string,
): Promise<CommandResponse<Book[]>> {
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
      if (!entry.name.endsWith(".pdf")) continue;
      returnResult.push({
         id: entry.inode,
         fileName: entry.name,
         filePath: entry.absolutePath,
         metaData: {},
      });
   }
   return {
      success: true,
      data: returnResult,
   };
}

export async function getBookPdfMetaData(
   pdfPath: string,
): Promise<BookPdfMetaData> {
   const bookMetaData: BookPdfMetaData = {};
   try {
      const fileData = await readFile(pdfPath);
      const pdf = await pdfjs.getDocument({ data: fileData }).promise;

      // Get title
      const metaData = await pdf.getMetadata();
      const info = metaData.info;
      if ("Title" in info) {
         bookMetaData.title = info.Title as string;
      }

      // Get cover
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
         return bookMetaData;
      }
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await firstPage.render({
         canvasContext: context,
         viewport: viewport,
      }).promise;
      const coverUrl = canvas.toDataURL("image/png");
      bookMetaData.cover = coverUrl;
   } catch (e) {
      const error = e as Error;
      console.error("Error occured when get book pdf metadata", error.message);
   }
   return bookMetaData;
}
