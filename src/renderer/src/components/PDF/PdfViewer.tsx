import "pdfjs-dist/web/pdf_viewer.css";
import { FixedSizeList, ListOnScrollProps } from "react-window";
import { PdfPage } from "./PdfPage";
import AutoSizer from "react-virtualized-auto-sizer";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePdfStore } from "@/stores/pdfStore";
import { useShallow } from "zustand/react/shallow";
import throttle from "lodash/throttle";
import "@/assets/styles/scrolbar.css";
import { TextSelectionActionBar } from "../TextSelectionActionBar/TextSelectionActionBar";
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
   const contentScrollContainerRef = useRef<FixedSizeList<any>>(null);
   const textSelectionActionBarRef = useRef<{
      setOpen: (
         open: boolean,
         position?: { x: number; y: number },
         selectedText?: string,
      ) => void;
      isOpen: boolean;
   }>(null);
   const pageBorderSize = 10;
   const {
      documentProxy,
      numPages,
      originalDimension,
      currentScale,
      setPdfState,
      viewControl,
      navigatePageIndex,
   } = usePdfStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
         numPages: state.state.numPages,
         originalDimension: state.state.originalDimension,
         currentScale: state.state.currentScale,
         setPdfState: state.setPdfState,
         viewControl: state.state.viewControl,
         navigatePageIndex: state.state.navigatePageIndex,
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
         return scaleValue;
      }
      if (
         currentScale.scaleType === "fit-width" &&
         (viewControl.pageLayout === "double-page" ||
            viewControl.pageLayout === "cover-facing-page")
      ) {
         const availableWidth = viewDimension.width - pageBorderSize * 4;
         const availablePageWidth = availableWidth / 2 - 5;
         const scaleValue = availablePageWidth / originalDimension.width;
         return scaleValue;
      }
      if (currentScale.scaleType === "fit-height") {
         const scaleValue = viewDimension.height / originalDimension.height;
         return scaleValue;
      }
      if (currentScale.scaleType === "percentage" && currentScale.scaleValue) {
         return currentScale.scaleValue / 100;
      }
      return 1;
   }, [
      originalDimension,
      viewDimension,
      currentScale.scaleType,
      viewControl.pageLayout,
      currentScale.scaleValue,
   ]);

   // This useEffect is used to navigate to the page when property navigatePage is set/changed.
   // Note: The container element is conditionally rendered, so it may not be available on the
   // first render. We include the ref in the useEffect dependency array to ensure the effect runs
   // again when the container mounts.
   useEffect(() => {
      if (!navigatePageIndex || !contentScrollContainerRef.current) return;
      const navigateIndex = navigatePageIndex;
      contentScrollContainerRef.current.scrollToItem(navigateIndex, "start");
   }, [navigatePageIndex, contentScrollContainerRef.current]);

   useEffect(() => {
      const viewContainer = viewContainerRef.current;
      if (!viewContainer || !documentProxy || !originalDimension) return;
      setViewDimension({
         width: viewContainer.offsetWidth,
         height: viewContainer.offsetHeight,
      });
   }, [documentProxy, originalDimension]);

   useEffect(() => {
      if (!originalDimension) {
         return;
      }
      if (
         currentScale.scaleValue &&
         Math.ceil(scale * 100) === Math.ceil(currentScale.scaleValue * 100)
      ) {
         return;
      }
      setPdfState({
         currentScale: {
            scaleType: currentScale.scaleType,
            scaleValue: Math.round(scale * 100),
         },
      });
      setItemSize(originalDimension.height * scale);
   }, [scale, originalDimension]);

   // Setup resize observer to update view dimension
   useEffect(() => {
      const viewContainer = viewContainerRef.current;
      if (!viewContainer) return;
      const resizeObserver = new ResizeObserver(() => {
         throttleSetViewDimension(viewContainer);
      });
      resizeObserver.observe(viewContainer);
      return () => resizeObserver.disconnect();
   }, []);

   const throttleSetViewDimension = throttle(
      (viewContainer: HTMLDivElement) => {
         setViewDimension({
            width: viewContainer.offsetWidth,
            height: viewContainer.offsetHeight,
         });
      },
      200,
   );
   const PageRow = ({ index, style }) => {
      if (!originalDimension) return null;
      const defaultWidth = originalDimension.width * scale;
      const defaultHeight = originalDimension.height * scale;
      if (viewControl.pageLayout === "single-page") {
         return (
            <div style={style} className="flex justify-center">
               <PdfPage
                  pageNumber={index + 1}
                  scale={scale}
                  defaultWidth={defaultWidth}
                  defaultHeight={defaultHeight}
               />
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
      textSelectionActionBarRef.current?.setOpen(false);
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

   const handleSelectionChange = (event: React.MouseEvent<HTMLDivElement>) => {
      const selection = window.getSelection();
      if (!selection) {
         textSelectionActionBarRef.current?.setOpen(false);
         return;
      }
      const selectedText = selection.toString();
      if (selectedText.length === 0) {
         textSelectionActionBarRef.current?.setOpen(false);
         return;
      }
      if (textSelectionActionBarRef.current?.isOpen) {
         return;
      }
      const actionBarPosition = {
         x: event.clientX + 10,
         y: event.clientY + 10,
      };
      textSelectionActionBarRef.current?.setOpen(
         true,
         actionBarPosition,
         selectedText,
      );
   };
   return (
      <div
         className="pdfViewer w-full h-screen flex"
         ref={viewContainerRef}
         style={{ "--scale-factor": scale } as React.CSSProperties}
         onWheel={handleWheel}
         onMouseUp={handleSelectionChange}
      >
         <AutoSizer disableWidth={true} className="w-full">
            {({ height }) => {
               // If Everything is not set which means the setup is not finished, return empty div
               if (!documentProxy || !originalDimension || !viewDimension) {
                  return <div></div>;
               }
               return (
                  <FixedSizeList
                     ref={contentScrollContainerRef}
                     height={height}
                     className="dark-lean-scrollbar"
                     width="100%"
                     itemCount={fixedListItemCount}
                     itemSize={itemSize + pageBorderSize * 2}
                     onScroll={handleScroll}
                  >
                     {PageRow}
                  </FixedSizeList>
               );
            }}
         </AutoSizer>
         <TextSelectionActionBar ref={textSelectionActionBarRef} />
      </div>
   );
}
