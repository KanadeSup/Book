import "pdfjs-dist/web/pdf_viewer.css";
import { FixedSizeList, ListOnScrollProps } from "react-window";
import { PdfPage } from "./PdfPage";
import AutoSizer from "react-virtualized-auto-sizer";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePdfStore } from "@/stores/pdfStore";
import { useShallow } from "zustand/react/shallow";
import throttle from "lodash/throttle";

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
   const pageBorderSize = 10;
   const {
      documentProxy,
      numPages,
      originalDimension,
      currentScale,
      setPdfState,
      setPageScrollContainer,
      viewControl,
   } = usePdfStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
         numPages: state.state.numPages,
         originalDimension: state.state.originalDimension,
         currentScale: state.state.currentScale,
         setPdfState: state.setPdfState,
         viewControl: state.state.viewControl,
         setPageScrollContainer: state.setPageScrollContainer,
      })),
   );

   const scale = useMemo(() => {
      if (!originalDimension || !viewDimension) return 1;
      if (
         currentScale.scaleType === "fit-width" &&
         viewControl.pageLayout === "single-page"
      ) {
         const pageWidthIncludeBorder =
            originalDimension.width + pageBorderSize * 2;
         const scaleValue = viewDimension.width / pageWidthIncludeBorder;
         setItemSize(originalDimension.height * scaleValue);
         setPdfState({
            currentScale: {
               scaleType: "fit-width",
               scaleValue: Math.round(scaleValue * 100),
            },
         });
         return scaleValue;
      }
      if (
         currentScale.scaleType === "fit-width" &&
         (viewControl.pageLayout === "double-page" ||
            viewControl.pageLayout === "cover-facing-page")
      ) {
         const pageWidthIncludeBorder =
            originalDimension.width * 2 + pageBorderSize * 2;
         const scaleValue = viewDimension.width / pageWidthIncludeBorder;
         setItemSize(originalDimension.height * scaleValue);
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
   }, [
      originalDimension,
      viewDimension,
      currentScale.scaleValue,
      currentScale.scaleType,
      viewControl.pageLayout,
   ]);

   useEffect(() => {
      const viewContainer = viewContainerRef.current;
      if (!viewContainer || !documentProxy || !originalDimension) return;
      setViewDimension({
         width: viewContainer.offsetWidth,
         height: viewContainer.offsetHeight,
      });
   }, [documentProxy, originalDimension]);

   const PageRow = ({ index, style }) => {
      if (viewControl.pageLayout === "single-page") {
         return (
            <div style={style} className="flex justify-center">
               <PdfPage pageNumber={index + 1} scale={scale} />
            </div>
         );
      }
      if (viewControl.pageLayout === "double-page") {
         return (
            <div style={style} className="flex justify-center">
               <PdfPage
                  pageNumber={index * 2 + 1}
                  scale={scale}
                  borderSize={pageBorderSize}
               />
               <PdfPage
                  pageNumber={index * 2 + 2}
                  scale={scale}
                  borderSize={pageBorderSize}
               />
            </div>
         );
      }
      if (viewControl.pageLayout === "cover-facing-page") {
         return index === 0 ? (
            <div style={style} className="flex justify-center">
               <PdfPage
                  pageNumber={index + 1}
                  scale={scale}
                  borderSize={pageBorderSize}
               />
            </div>
         ) : (
            <div style={style} className="flex justify-center">
               <PdfPage
                  pageNumber={index * 2}
                  scale={scale}
                  borderSize={pageBorderSize}
               />
               <PdfPage
                  pageNumber={index * 2 + 1}
                  scale={scale}
                  borderSize={pageBorderSize}
               />
            </div>
         );
      }

      // fallback to single page layout
      return (
         <div style={style} className="flex justify-center">
            <PdfPage
               pageNumber={index + 1}
               scale={scale}
               borderSize={pageBorderSize}
            />
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
   const handleScroll = throttle(({ scrollOffset }: ListOnScrollProps) => {
      const pageSize = itemSize + pageBorderSize * 2;
      const currentPage = Math.round(scrollOffset / pageSize) + 1;
      setPdfState({
         currentPage,
      });
   }, 100);

   const fixedListItemCount = useMemo(() => {
      if (viewControl.pageLayout === "single-page") {
         return numPages;
      }
      if (
         viewControl.pageLayout === "double-page" ||
         viewControl.pageLayout === "cover-facing-page"
      ) {
         return Math.ceil(numPages / 2);
      }
      return numPages;
   }, [numPages, viewControl.pageLayout]);
   return (
      <div
         className="pdfViewer w-full h-screen"
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
                     ref={(fixedSizeList) => {
                        if (!fixedSizeList) return;
                        setPageScrollContainer(fixedSizeList);
                     }}
                     height={height}
                     width={width}
                     itemCount={fixedListItemCount}
                     itemSize={itemSize + pageBorderSize * 2}
                     onScroll={handleScroll}
                  >
                     {PageRow}
                  </FixedSizeList>
               );
            }}
         </AutoSizer>
      </div>
   );
}
