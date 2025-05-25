import "pdfjs-dist/web/pdf_viewer.css";
import "@/assets/styles/scrolbar.css";
import { FixedSizeList, ListOnScrollProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { PDFPage } from "./PDFPage";
import { useShallow } from "zustand/react/shallow";
import { usePDFStore, usePDFStoreActions } from "./PDFProvider";
import { throttle } from "lodash";
import { useMemo, useRef } from "react";
import { useConfigStore } from "@/stores/configStore";

export function PDFViewer() {
   const scrollAmountTotal = useRef(0);
   const pageGapSize = useConfigStore((state) => state.config.pageGapSize);
   const { numPages, basePDFPageSize, currentScale, pageLayout } = usePDFStore(
      useShallow((state) => ({
         numPages: state.numPages,
         basePDFPageSize: state.basePDFPageSize,
         currentScale: state.currentPageScale,
         pageLayout: state.currentPageLayout,
      })),
   );
   const { updateState, changeCurrentScale } = usePDFStoreActions();
   const viewContainerRef = (element: HTMLDivElement) => {
      updateState({
         viewContainer: element,
      });
   };
   const contentScrollContainerRef = (element: FixedSizeList) => {
      updateState({
         pageScrollContainer: element,
      });
   };
   const handleScroll = throttle(({ scrollOffset }: ListOnScrollProps) => {
      if (!basePDFPageSize) return;
      const currentScaleValue = currentScale.scalePercentage / 100;
      if (pageLayout === "single-page") {
         const currentPDFPageHeight =
            basePDFPageSize.height * currentScaleValue;
         const currentPage =
            Math.round(scrollOffset / currentPDFPageHeight) + 1;
         updateState({
            currentPage,
         });
      }
      if (pageLayout === "double-page") {
         const currentPDFPageHeight =
            (basePDFPageSize.height * currentScaleValue) / 2;
         const currentPage =
            Math.round(scrollOffset / currentPDFPageHeight) * 2 + 1;
         updateState({
            currentPage,
         });
      }
      if (pageLayout === "cover-facing-page") {
         const currentPDFPageHeight =
            (basePDFPageSize.height * currentScaleValue) / 2;
         const currenRow = Math.round(scrollOffset / currentPDFPageHeight) + 1;
         const currenPage = currenRow <= 2 ? currenRow : (currenRow - 1) * 2;
         updateState({
            currentPage: currenPage,
         });
      }
   }, 100);

   const fixedSizeListNumRows = useMemo(() => {
      if (pageLayout === "single-page") {
         return numPages;
      }
      if (pageLayout === "double-page") {
         return Math.ceil(numPages / 2);
      }
      if (pageLayout === "cover-facing-page") {
         return Math.floor(numPages / 2) + 1;
      }
      return 0;
   }, [pageLayout, numPages, currentScale]);
   const fixedSizeListItemSize = useMemo(() => {
      if (!basePDFPageSize) return 0;

      const currentScaleValue = currentScale.scalePercentage / 100;
      return basePDFPageSize.height * currentScaleValue + pageGapSize * 2;
   }, [pageLayout, numPages, currentScale, pageGapSize]);

   const fixedSizeRowWidth = useMemo(() => {
      if (!basePDFPageSize) return 0;
      const currentScaleValue = currentScale.scalePercentage / 100;
      return basePDFPageSize.width * currentScaleValue;
   }, [basePDFPageSize, currentScale]);

   const PDFPageRow = ({ index, style }) => {
      const pageScale = currentScale.scalePercentage / 100;
      const { height: baseHeight, width: baseWidth } = basePDFPageSize || {};
      if (pageLayout === "single-page") {
         return (
            <div
               style={{
                  ...style,
                  padding: `${pageGapSize}px`,
                  width: fixedSizeRowWidth,
                  minWidth: "100%",
               }}
               className="grid place-items-start justify-items-center"
               key={index}
            >
               <PDFPage
                  pageNumber={index + 1}
                  scale={pageScale}
                  defaultHeight={baseHeight && baseHeight * pageScale}
                  defaultWidth={baseWidth && baseWidth * pageScale}
               />
            </div>
         );
      }
      if (pageLayout === "double-page") {
         return (
            <div
               style={{
                  ...style,
                  padding: `${pageGapSize}px`,
                  width: fixedSizeRowWidth,
                  minWidth: "100%",
               }}
               className="grid place-items-start justify-items-center"
               key={index}
            >
               <div
                  className="flex"
                  style={{
                     gap: `${pageGapSize * 2}px`,
                  }}
               >
                  <PDFPage
                     pageNumber={index * 2 + 1}
                     scale={pageScale}
                     defaultHeight={baseHeight && baseHeight * pageScale}
                     defaultWidth={baseWidth && baseWidth * pageScale}
                  />
                  <PDFPage
                     pageNumber={index * 2 + 2}
                     scale={pageScale}
                     defaultHeight={baseHeight && baseHeight * pageScale}
                     defaultWidth={baseWidth && baseWidth * pageScale}
                  />
               </div>
            </div>
         );
      }
      if (pageLayout === "cover-facing-page") {
         return index === 0 ? (
            <div
               style={{
                  ...style,
                  padding: `${pageGapSize * 2}px`,
                  width: fixedSizeRowWidth,
                  minWidth: "100%",
               }}
               className="grid place-items-start justify-items-center"
               key={index}
            >
               <PDFPage
                  pageNumber={index + 1}
                  scale={pageScale}
                  defaultHeight={baseHeight && baseHeight * pageScale}
                  defaultWidth={baseWidth && baseWidth * pageScale}
               />
            </div>
         ) : (
            <div
               style={{
                  ...style,
                  padding: `${pageGapSize * 2}px`,
                  width: fixedSizeRowWidth,
                  minWidth: "100%",
               }}
               className="grid place-items-start justify-items-center"
               key={index}
            >
               <div
                  className="flex"
                  style={{
                     gap: `${pageGapSize * 2}px`,
                  }}
               >
                  <PDFPage
                     pageNumber={index * 2}
                     scale={pageScale}
                     defaultHeight={baseHeight && baseHeight * pageScale}
                     defaultWidth={baseWidth && baseWidth * pageScale}
                  />
                  <PDFPage
                     pageNumber={index * 2 + 1}
                     scale={pageScale}
                     defaultHeight={baseHeight && baseHeight * pageScale}
                     defaultWidth={baseWidth && baseWidth * pageScale}
                  />
               </div>
            </div>
         );
      }
      return null;
   };
   const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      if (!event.ctrlKey) return;
      if (!currentScale.scalePercentage) {
         console.error("currentScale.scalePercentage is undefined");
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
         currentScale.scalePercentage = currentScale.scalePercentage - 10;
         scrollAmountTotal.current = 0;
         changeCurrentScale("percentage", currentScale.scalePercentage - 10);
      } else if (scrollAmountTotal.current < -THRESHOLD) {
         currentScale.scalePercentage = currentScale.scalePercentage + 10;
         scrollAmountTotal.current = 0;
         changeCurrentScale("percentage", currentScale.scalePercentage + 10);
      }
   };
   if (!basePDFPageSize || !numPages) {
      return <div>Loading...</div>;
   }
   return (
      <div
         className="pdfViewer w-full h-screen overflow-hidden"
         onWheel={handleWheel}
         style={
            {
               "--scale-factor":
                  pageLayout === "single-page"
                     ? currentScale.scalePercentage / 100
                     : currentScale.scalePercentage / 100 / 2,
            } as React.CSSProperties
         }
      >
         <AutoSizer disableWidth={true} className="w-full overflow-hidden">
            {({ height }) => {
               return (
                  <FixedSizeList
                     ref={contentScrollContainerRef}
                     outerRef={viewContainerRef}
                     height={height}
                     className="dark-lean-scrollbar"
                     width="100%"
                     itemCount={fixedSizeListNumRows}
                     itemSize={fixedSizeListItemSize}
                     onScroll={handleScroll}
                  >
                     {PDFPageRow}
                  </FixedSizeList>
               );
            }}
         </AutoSizer>
      </div>
   );
}
