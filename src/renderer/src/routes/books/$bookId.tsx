import { Viewer } from "@/components/PDF/Viewer";
import { pdfjs } from "@/lib/pdfjs";
import { readFile } from "@/services/fileSystem";
import { createFileRoute } from "@tanstack/react-router";
import { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/books/$bookId")({
   component: BookViewerPage,
});

function BookViewerPage() {
   const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy>()
   useEffect(() =>{
      async function fetch() {
         const fileData = await readFile("/home/bubuntu/books/Python_Concurrency_with_asyncio_Matthew_Fowler_Manning,_2022.pdf");
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