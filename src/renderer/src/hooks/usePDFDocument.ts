import { useEffect, useState } from "react";
import { PDFDocumentProxy } from "pdfjs-dist";
import { pdfjs } from "@/lib/pdfjs";
import { readFile } from "@/services/fileSystem";

export function usePDFDocument(pdfPath: string) {
   const [documentProxy, setDocumentProxy] = useState<
      PDFDocumentProxy | undefined
   >(undefined);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [isError, setIsError] = useState<boolean>(false);

   useEffect(() => {
      async function loadDocument() {
         try {
            setIsLoading(true);
            const fileData = await readFile(pdfPath);
            const loadingTask = await pdfjs.getDocument({ data: fileData });
            const proxy = await loadingTask.promise;
            setDocumentProxy(proxy);
            setIsLoading(false);
         } catch (error) {
            setIsError(true);
            setIsLoading(false);
         }
      }
      loadDocument();
   }, [pdfPath]);
   return { documentProxy, isLoading, isError };
}
