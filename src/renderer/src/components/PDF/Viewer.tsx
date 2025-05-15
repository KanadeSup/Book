import "pdfjs-dist/web/pdf_viewer.css";
import { FixedSizeList } from "react-window";
import { PdfPage } from "./PdfPage";
import AutoSizer from "react-virtualized-auto-sizer";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePdfStore } from "@/stores/pdfStore";
import { useShallow } from "zustand/react/shallow";

export type ViewerProps = {};

type Dimension = {
   width: number;
   height: number;
};
export function Viewer() {
   const viewContainerRef = useRef<HTMLDivElement>(null);
   const [viewDimension, setViewDimension] = useState<Dimension>();
   const [itemSize, setItemSize] = useState<number>(1);
   const { documentProxy, numPages, originalDimension, currentScale } =
      usePdfStore(
         useShallow((state) => ({
            documentProxy: state.documentProxy,
            numPages: state.state.numPages,
            originalDimension: state.state.originalDimension,
            currentScale: state.state.currentScale,
         })),
      );

   const scale = useMemo(() => {
      if (!originalDimension || !viewDimension) return 1;
      if (currentScale.scaleType === "fit-width") {
         setItemSize(
            originalDimension.width *
               (viewDimension.width / originalDimension.width),
         );
         return viewDimension.width / originalDimension.width;
      }
      if (currentScale.scaleType === "fit-height") {
         setItemSize(
            originalDimension.height *
               (viewDimension.height / originalDimension.height),
         );
         return viewDimension.height / originalDimension.height;
      }
      if (currentScale.scaleType === "percentage" && currentScale.scaleValue) {
         setItemSize(
            originalDimension.height * (currentScale.scaleValue / 100),
         );
         return currentScale.scaleValue / 100;
      }
      return 1;
   }, [originalDimension, viewDimension, currentScale]);
   useEffect(() => {
      const viewContainer = viewContainerRef.current;
      if (!viewContainer || !documentProxy || !originalDimension) return;
      setViewDimension({
         width: viewContainer.offsetWidth,
         height: viewContainer.offsetHeight,
      });
   }, [documentProxy, originalDimension]);

   const PageRow = ({ index, style }) => {
      return (
         <div style={style} className="flex justify-center">
            <PdfPage pageNumber={index + 1} scale={scale} />
         </div>
      );
   };

   return (
      <div
         className="pdfViewer w-full h-screen box-content"
         ref={viewContainerRef}
         style={{ "--scale-factor": scale } as React.CSSProperties}
      >
         <AutoSizer>
            {({ height, width }) => {
               // If Everything is not set which means the setup is not finished, return empty div
               if (!documentProxy || !originalDimension || !viewDimension) {
                  return <div></div>;
               }
               return (
                  <FixedSizeList
                     height={height}
                     width={width}
                     itemCount={numPages}
                     itemSize={itemSize}
                  >
                     {PageRow}
                  </FixedSizeList>
               );
            }}
         </AutoSizer>
      </div>
   );
}
