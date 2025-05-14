import { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useEffect, useRef } from "react";

export type PdfPageProps = {
   documentProxy?: PDFDocumentProxy;
   pageNumber: number;
   scale?: number;
};
export function PdfPage(props: PdfPageProps) {
   const pageContainerRef = useRef<HTMLDivElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   useEffect(() => {
      const pageContainer = pageContainerRef.current;
      const canvas = canvasRef.current;
      const documentProxy = props.documentProxy;
      if (!documentProxy || !canvas || !pageContainer) return;

      let renderTask: RenderTask | null = null;
      let cancelled = false;

      const renderPage = async function () {
         const pageProxy = await documentProxy.getPage(props.pageNumber);
         const viewport = pageProxy.getViewport({ scale: props.scale ?? 1 });

         // Set draw resolution for canvas
         canvas.width = viewport.width;
         canvas.height = viewport.height;

         // Set dimension
         canvas.style.width = `${viewport.width}px`;
         canvas.style.height = `${viewport.height}px`;

         // render page
         const ctx = canvas.getContext("2d");
         if (!ctx) {
            throw Error("Cannot get canvas context");
         }
         if (cancelled) return;
         renderTask = pageProxy.render({
            canvasContext: ctx,
            viewport: viewport,
         });
         await renderTask.promise;
      };
      renderPage();
      return () => {
         cancelled = true;
         renderTask?.cancel();
      };
   }, [pageContainerRef.current, props.documentProxy]);

   return (
      <div ref={pageContainerRef} className="">
         <canvas ref={canvasRef} className=""></canvas>
      </div>
   );
}
