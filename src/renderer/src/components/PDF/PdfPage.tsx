import { usePdfStore } from "@/stores/pdfStore";
import { RenderTask, TextLayer } from "pdfjs-dist";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

export type PdfPageProps = {
   pageNumber: number;
   scale?: number;
   borderSize?: number;
   defaultWidth?: number;
   defaultHeight?: number;
};
export function PdfPage(props: PdfPageProps) {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const textLayerRef = useRef<HTMLDivElement>(null);
   const pageRef = useRef<HTMLDivElement>(null);
   const { documentProxy } = usePdfStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
      })),
   );
   useEffect(() => {
      const canvas = canvasRef.current;
      const textLayerDiv = textLayerRef.current;
      const pageDiv = pageRef.current;
      if (!documentProxy || !canvas || !textLayerDiv || !pageDiv) return;

      let renderTask: RenderTask | null = null;
      let textLayer: TextLayer | null = null;
      let cancelled = false;

      const renderPage = async function () {
         const pageProxy = await documentProxy.getPage(props.pageNumber);
         const viewport = pageProxy.getViewport({ scale: props.scale ?? 1 });

         // Set draw resolution for canvas
         canvas.width = viewport.width;
         canvas.height = viewport.height;

         pageDiv.style.width = `${viewport.width}px`;
         pageDiv.style.height = `${viewport.height}px`;

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
         if (cancelled) return;
         textLayer = new TextLayer({
            textContentSource: await pageProxy.getTextContent(),
            container: textLayerDiv,
            viewport: viewport,
         });
         await textLayer.render();
      };
      renderPage();
      return () => {
         cancelled = true;
         renderTask?.cancel();
         textLayer?.cancel();
      };
   }, [documentProxy]);

   return (
      <div
         ref={pageRef}
         className="page m-0! box-content"
         style={{
            border: `${props.borderSize ?? 0}px solid transparent`,
            width: props.defaultWidth ? props.defaultWidth : "auto",
            height: props.defaultHeight ? props.defaultHeight : "auto",
         }}
      >
         <div className="canvasWrapper">
            <canvas ref={canvasRef}></canvas>
         </div>
         <div ref={textLayerRef} className="textLayer"></div>
      </div>
   );
}
