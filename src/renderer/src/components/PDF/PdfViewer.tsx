import "pdfjs-dist/web/pdf_viewer.css";
import { FixedSizeList } from "react-window";
import { PdfPage } from "./PdfPage";
import AutoSizer from "react-virtualized-auto-sizer";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePdfStore } from "@/stores/pdfStore";
import { useShallow } from "zustand/react/shallow";

export type PdfViewerProps = {};

type Dimension = {
   width: number;
   height: number;
};
export function PdfViewer() {
   const viewContainerRef = useRef<HTMLDivElement>(null);
   const [viewDimension, setViewDimension] = useState<Dimension>();
   const [itemSize, setItemSize] = useState<number>(1);
   const scrollAmountTotal = useRef<number>(0);
   const { documentProxy, numPages, originalDimension, currentScale, setPdfState } =
      usePdfStore(
         useShallow((state) => ({
            documentProxy: state.documentProxy,
            numPages: state.state.numPages,
            originalDimension: state.state.originalDimension,
            currentScale: state.state.currentScale,
            setPdfState: state.setPdfState,
         })),
      );
   

   const scale = useMemo(() => {
      if (!originalDimension || !viewDimension) return 1;
      if (currentScale.scaleType === "fit-width") {
         const scaleValue = viewDimension.width / originalDimension.width;
         setItemSize(originalDimension.width * scaleValue);
         setPdfState({
            currentScale: {
               scaleType: "fit-width",
               scaleValue: Math.round(scaleValue * 100),
            },
         });
         return scaleValue;
      }
      if (currentScale.scaleType === "fit-height") {
         const scaleValue = viewDimension.height / originalDimension.height;
         setItemSize(originalDimension.height * scaleValue);
         setPdfState({
            currentScale: {
               scaleType: "fit-height",
               scaleValue: Math.round(scaleValue * 100),
            },
         });
         return scaleValue;
      }
      if (currentScale.scaleType === "percentage" && currentScale.scaleValue) {
         setItemSize(
            originalDimension.height * (currentScale.scaleValue / 100),
         );
         return currentScale.scaleValue / 100;
      }
      return 1;
   }, [originalDimension, viewDimension, currentScale.scaleValue, currentScale.scaleType]);

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

   const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      if (!event.ctrlKey) return;
      if (!currentScale.scaleValue) {
         // Not throw error, because it can cause performance issue
         // so just log error instead
         console.error("currentScale.scaleValue is undefined");
         return;
      }
      const THRESHOLD = 150;
      const eventScrollAmount = event.deltaY;
      const eventScrollAmountSign = Math.sign(eventScrollAmount);
      const totalScrollAmountSign = Math.sign(scrollAmountTotal.current);
      if (eventScrollAmountSign !== totalScrollAmountSign) {
         scrollAmountTotal.current = eventScrollAmount;
      } else {
         scrollAmountTotal.current += eventScrollAmount;
      }

      
      if (scrollAmountTotal.current > THRESHOLD) {
         currentScale.scaleValue = currentScale.scaleValue - 10;
         scrollAmountTotal.current = 0;
         setPdfState({
            currentScale: {
               scaleType: "percentage",
               scaleValue: currentScale.scaleValue - 10,
            },
         });
      } else if (scrollAmountTotal.current < -THRESHOLD) {
         scrollAmountTotal.current = 0;
         setPdfState({
            currentScale: {
               scaleType: "percentage",
               scaleValue: currentScale.scaleValue + 10,
            },
         });
      }
   };

   return (
      <div
         className="pdfViewer w-full h-screen box-content"
         ref={viewContainerRef}
         style={{ "--scale-factor": scale } as React.CSSProperties}
         onWheel={handleWheel}
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
