import { Viewer } from "@/components/PDF/Viewer";
import { pdfjs } from "@/lib/pdfjs";
import { readFile } from "@/services/fileSystem";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useState } from "react";
import { useConfigStore } from "@/stores/configStore";
import { getBooks } from "@/services/book";
import { SpacePathInvalidError } from "@/lib/errors/spacePathInvalidError";

export const Route = createFileRoute("/books/$bookId")({
   loader: async ({ params }) => {
      const bookId = params.bookId;
      const setupPath = "/setup";
      const stateStr = useConfigStore.getState().config.spacePath;
      if (!stateStr) {
         throw redirect({ to: setupPath });
      }
      const res = await getBooks(stateStr);
      if (!res.success) {
         throw new SpacePathInvalidError("");
      }
      const book = res.data.find((book) => book.id === Number(bookId));
      if (!book) {
         console.error("Book not found with id: ", bookId);
         throw redirect({ to: "/" });
      }
      return {
         book,
      };
   },
   onError: (error) => {
      if (error instanceof SpacePathInvalidError) {
         throw redirect({ to: "/setup" });
      }
      throw error;
   },
   component: BookViewerPage,
});

function BookViewerPage() {
   const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy>()
   const { book } = Route.useLoaderData();
   useEffect(() =>{
      async function fetch() {
         const fileData = await readFile(book.filePath);
         const proxy = await pdfjs.getDocument({ data: fileData }).promise;
         setDocumentProxy(proxy)
      }
      fetch()
   }, [])
   return (
      <div>
         <Viewer documentProxy={documentProxy}/>
      </div>
   )
}