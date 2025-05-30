import "pdfjs-dist/web/pdf_viewer.css";
import "@/assets/styles/scrolbar.css";
import { PDFPage } from "./PDFPage";
import { useShallow } from "zustand/react/shallow";
import { usePDFStore, usePDFStoreActions } from "./PDFProvider";
import { throttle } from "lodash";
import { memo, useEffect, useMemo, useRef } from "react";
import { useConfigStore } from "@/stores/configStore";
import { useSelectPDFText } from "@/hooks/useSelectPDFText";
import { useVirtualizer } from "@tanstack/react-virtual";

// Constants
const ZOOM_THRESHOLD = 150;
const ZOOM_STEP = 10;

export function PDFViewer() {
   const scrollAmountTotal = useRef(0);
   const pageGapSize = useConfigStore((state) => state.config.pageGapSize);
   const {
      numPages,
      basePDFPageSize,
      currentPageScale,
      pageLayout,
      scrollElement,
   } = usePDFStore(
      useShallow((state) => ({
         numPages: state.numPages,
         basePDFPageSize: state.basePDFPageSize,
         currentPageScale: state.currentPageScale,
         pageLayout: state.currentPageLayout,
         scrollElement: state.scrollElement,
      })),
   );
   // const { selectedText, setSelectedText } = useSelectPDFText(wrapperRef);
   const {
      setVirtualizerInstance,
      setScrollElement,
      setCurrentPage,
      changeCurrentScale,
   } = usePDFStoreActions();

   // calculate number of rows
   const numRows = useMemo(() => {
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
   }, [pageLayout, numPages]);

   // calculate row height
   const rowHeight = useMemo(() => {
      if (!basePDFPageSize) return 0;

      const currentPageScaleValue = currentPageScale.scalePercentage / 100;
      return basePDFPageSize.height * currentPageScaleValue + pageGapSize * 2;
   }, [currentPageScale.scalePercentage, pageGapSize, basePDFPageSize]);

   // calculate row width
   const rowWidth = useMemo(() => {
      if (!basePDFPageSize) return 0;
      const currentPageScaleValue = currentPageScale.scalePercentage / 100;
      return basePDFPageSize.width * currentPageScaleValue;
   }, [basePDFPageSize, currentPageScale.scalePercentage]);

   // handle Zoom PDF page
   const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      // Check if the user is holding down the ctrl key
      if (!event.ctrlKey) return;

      // validate required value
      if (!currentPageScale.scalePercentage) {
         console.error("Missing scale percentage value");
         return;
      }

      // Handle scroll direction and accumulation
      const scrollAmount = event.deltaY;
      const isScrollDirectionChanged =
         Math.sign(scrollAmount) !== Math.sign(scrollAmountTotal.current);

      scrollAmountTotal.current = isScrollDirectionChanged
         ? scrollAmount
         : scrollAmountTotal.current + scrollAmount;

      // Handle zoom based on accumulated scroll
      const handleZoom = (zoomIn: boolean) => {
         const newScale =
            currentPageScale.scalePercentage +
            (zoomIn ? ZOOM_STEP : -ZOOM_STEP);
         scrollAmountTotal.current = 0;
         changeCurrentScale("percentage", newScale);
      };

      if (Math.abs(scrollAmountTotal.current) > ZOOM_THRESHOLD) {
         handleZoom(scrollAmountTotal.current < 0);
      }
   };

   // Handle update current page when scroll
   const handleScroll = throttle((event: React.UIEvent<HTMLDivElement>) => {
      // validate required value
      if (!basePDFPageSize || !currentPageScale.scalePercentage) return;

      const scrollOffset = event.currentTarget.scrollTop;
      const { height: basePDFHeight } = basePDFPageSize;
      const currentPageScaleValue = currentPageScale.scalePercentage / 100;

      const calculateCurrentPage = () => {
         const basePageHeight = basePDFHeight * currentPageScaleValue;
         const pageHeightIncludeGap = basePageHeight + pageGapSize * 2;

         switch (pageLayout) {
            case "single-page": {
               return Math.round(scrollOffset / pageHeightIncludeGap) + 1;
            }
            case "double-page": {
               return Math.round(scrollOffset / pageHeightIncludeGap) * 2 + 1;
            }
            case "cover-facing-page": {
               const currentRow =
                  Math.round(scrollOffset / pageHeightIncludeGap) + 1;
               return currentRow <= 2 ? currentRow : (currentRow - 1) * 2;
            }
            default:
               return 1;
         }
      };

      setCurrentPage(calculateCurrentPage());
   }, 100);

   // If required values are missing, return an empty div to indicate loading state
   const rowVirtualizer = useVirtualizer({
      count: numRows,
      getScrollElement: () => scrollElement ?? null,
      estimateSize: () => rowHeight,
      overscan: 3,
   });

   useEffect(() => {
      rowVirtualizer.measure();
   }, [rowHeight]);
   useEffect(() => {
      setVirtualizerInstance(rowVirtualizer);
   }, [rowVirtualizer]);

   if (!basePDFPageSize || !numPages) {
      return <div></div>;
   }

   return (
      <div
         className="pdfViewer w-full h-screen overflow-auto"
         onWheel={handleWheel}
         ref={(element) => {
            if (!element) return;
            setScrollElement(element);
         }}
         onScroll={handleScroll}
         style={
            {
               "--scale-factor":
                  pageLayout === "single-page"
                     ? currentPageScale.scalePercentage / 100
                     : currentPageScale.scalePercentage / 100 / 2,
            } as React.CSSProperties
         }
      >
         <div
            style={{
               height: `${rowVirtualizer.getTotalSize()}px`,
               width: "100%",
               position: "relative",
            }}
         >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
               <PDFPageRow
                  key={virtualRow.index}
                  index={virtualRow.index}
                  style={{
                     position: "absolute",
                     top: 0,
                     left: 0,
                     width: "100%",
                     height: `${virtualRow.size}px`,
                     transform: `translateY(${virtualRow.start}px)`,
                  }}
                  pageLayout={pageLayout}
                  pageGapSize={pageGapSize}
                  width={rowWidth}
                  pageScale={currentPageScale.scalePercentage / 100}
                  basePDFPageSize={basePDFPageSize}
               />
            ))}
         </div>
      </div>
   );
}

type PDFPageRowProps = {
   index: number;
   style: React.CSSProperties;
   pageLayout: string;
   pageGapSize: number;
   width: number;
   pageScale: number;
   basePDFPageSize: { height: number; width: number };
};
const PDFPageRow = memo(
   ({
      index,
      style,
      pageLayout,
      pageGapSize,
      width,
      pageScale,
      basePDFPageSize,
   }: PDFPageRowProps) => {
      const commonStyle = {
         ...style,
         width,
         minWidth: "100%",
      };
      const defaultPDFPageSize = {
         height: (basePDFPageSize.height * pageScale) / 100,
         width: (basePDFPageSize.width * pageScale) / 100,
      };

      const layoutComponents = {
         "single-page": () => (
            <SinglePageLayout
               commonStyle={commonStyle}
               index={index}
               pageScale={pageScale}
               defaultPDFPageSize={defaultPDFPageSize}
            />
         ),
         "double-page": () => (
            <DoublePageLayout
               commonStyle={commonStyle}
               index={index}
               pageScale={pageScale}
               pageGapSize={pageGapSize}
               defaultPDFPageSize={defaultPDFPageSize}
            />
         ),
         "cover-facing-page": () => (
            <CoverFacingPageLayout
               commonStyle={commonStyle}
               index={index}
               pageScale={pageScale}
               pageGapSize={pageGapSize}
               width={width}
               defaultPDFPageSize={defaultPDFPageSize}
            />
         ),
      };

      return layoutComponents[pageLayout]?.() || null;
   },
);

type SinglePageLayoutProps = {
   commonStyle: React.CSSProperties;
   index: number;
   pageScale: number;
   defaultPDFPageSize?: { height: number; width: number };
};
function SinglePageLayout({
   commonStyle,
   index,
   pageScale,
   defaultPDFPageSize,
}: SinglePageLayoutProps) {
   return (
      <div
         style={commonStyle}
         className="grid place-items-start justify-items-center"
      >
         <PDFPage
            pageNumber={index + 1}
            scale={pageScale}
            defaultHeight={defaultPDFPageSize?.height}
            defaultWidth={defaultPDFPageSize?.width}
         />
      </div>
   );
}

type DoublePageLayoutProps = {
   commonStyle: React.CSSProperties;
   index: number;
   pageScale: number;
   pageGapSize: number;
   defaultPDFPageSize?: { height: number; width: number };
};
function DoublePageLayout({
   commonStyle,
   index,
   pageScale,
   pageGapSize,
   defaultPDFPageSize,
}: DoublePageLayoutProps) {
   return (
      <div
         style={{
            ...commonStyle,
            padding: `${pageGapSize}px`,
         }}
         className="grid place-items-start justify-items-center"
      >
         <div className="flex" style={{ gap: `${pageGapSize * 2}px` }}>
            <PDFPage
               pageNumber={index * 2 + 1}
               scale={pageScale}
               defaultHeight={defaultPDFPageSize?.height}
               defaultWidth={defaultPDFPageSize?.width}
            />
            <PDFPage
               pageNumber={index * 2 + 2}
               scale={pageScale}
               defaultHeight={defaultPDFPageSize?.height}
               defaultWidth={defaultPDFPageSize?.width}
            />
         </div>
      </div>
   );
}

type CoverFacingPageProps = {
   commonStyle: React.CSSProperties;
   index: number;
   pageScale: number;
   pageGapSize: number;
   width: number;
   defaultPDFPageSize?: { height: number; width: number };
};
function CoverFacingPageLayout({
   commonStyle,
   index,
   pageScale,
   pageGapSize,
   width,
   defaultPDFPageSize,
}: CoverFacingPageProps) {
   const style = {
      ...commonStyle,
      padding: `${pageGapSize}px`,
      width,
      minWidth: "100%",
   };

   const isCoverPage = index === 0;
   if (isCoverPage) {
      return (
         <div
            style={style}
            className="grid place-items-start justify-items-center"
         >
            <PDFPage
               pageNumber={1}
               scale={pageScale}
               defaultHeight={defaultPDFPageSize?.height}
               defaultWidth={defaultPDFPageSize?.width}
            />
         </div>
      );
   }

   return (
      <div
         style={style}
         className="grid place-items-start justify-items-center"
      >
         <div className="flex" style={{ gap: `${pageGapSize * 2}px` }}>
            <PDFPage
               pageNumber={index * 2}
               scale={pageScale}
               defaultHeight={defaultPDFPageSize?.height}
               defaultWidth={defaultPDFPageSize?.width}
            />
            <PDFPage
               pageNumber={index * 2 + 1}
               scale={pageScale}
               defaultHeight={defaultPDFPageSize?.height}
               defaultWidth={defaultPDFPageSize?.width}
            />
         </div>
      </div>
   );
}
