import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePDFStore } from "./PDFProvider";
import { TextLayer } from "pdfjs-dist";
import { RenderTask } from "pdfjs-dist";

export type PDFPageProps = {
   pageNumber: number;
   scale?: number;
   defaultHeight?: number;
   defaultWidth?: number;
};
export function PDFPage(props: PDFPageProps) {
   const pageRef = useRef<HTMLDivElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const textLayerRef = useRef<HTMLDivElement>(null);
   const canvasRenderTaskRef = useRef<RenderTask | null>(null);
   const textLayerRenderTaskRef = useRef<TextLayer | null>(null);
   const { documentProxy } = usePDFStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
      })),
   );
   useEffect(() => {
      const canvas = canvasRef.current;
      const textLayerDiv = textLayerRef.current;
      const pageDiv = pageRef.current;
      if (!documentProxy || !canvas || !textLayerDiv || !pageDiv) return;

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
         try {
            const renderTask = pageProxy.render({
               canvasContext: ctx,
               viewport: viewport,
            });
            canvasRenderTaskRef.current = renderTask;
            await renderTask.promise;
            textLayerRenderTaskRef.current = new TextLayer({
               textContentSource: await pageProxy.getTextContent(),
               container: textLayerDiv,
               viewport: viewport,
            });
            await textLayerRenderTaskRef.current.render();
         } catch (error) {
            if (error instanceof Error && error.name === "RenderingCancelledException") {
               console.log('Rendering cancelled.');
            } else {
               console.error("Render error", error);
            }
         }
      };
      renderPage();
      return () => {
         cancelled = true;
         canvasRenderTaskRef.current?.cancel();
         textLayerRenderTaskRef.current?.cancel();
      };
   }, [documentProxy, props.scale]);
   return (
      <div
         ref={pageRef}
         className="page border-none! box-content"
         style={{
            width: props.defaultWidth ? props.defaultWidth : "auto",
            height: props.defaultHeight ? props.defaultHeight : "auto",
         }}
      >
         <div className="canvasWrapper">
            <canvas ref={canvasRef}></canvas>
         </div>
         <div
            ref={textLayerRef}
            className="textLayer"
            style={{
               userSelect: "text",
               WebkitUserSelect: "text",
               MozUserSelect: "text",
            }}
         ></div>
      </div>
   );
}
