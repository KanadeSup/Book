import { PDFDocumentProxy } from "pdfjs-dist";
import {
   PDFPageDimension,
   PDFPageScale,
   PDFPageLayout,
   PDFPageTransition,
   PDFPageScaleType,
   PDFOutline,
} from "@/types/pdf.types";
import { create } from "zustand";
import { useConfigStore } from "./configStore";
import { Virtualizer } from "@tanstack/react-virtual";

export type PDFStore = {
   documentProxy: PDFDocumentProxy | undefined;
   outlines: PDFOutline[] | undefined;
   numPages: number;
   currentPage: number;
   basePDFPageSize: PDFPageDimension | undefined;
   currentPageScale: PDFPageScale;
   currentPageLayout: PDFPageLayout;
   currentPageTransition: PDFPageTransition;
   virtualizerInstance: Virtualizer<HTMLDivElement, Element> | undefined;
   scrollElement: HTMLDivElement | undefined;

   actions: {
      setDocumentProxy: (documentProxy: PDFDocumentProxy) => void;
      setOutlines: (outlines: PDFOutline[]) => void;
      setNumPages: (numPages: number) => void;
      setCurrentPage: (currentPage: number) => void;
      setBasePDFPageSize: (basePDFPageSize: PDFPageDimension) => void;
      changeCurrentScale: (
         scaleType: PDFPageScaleType,
         scalePercentage?: number,
      ) => void;
      caculatePDFPageScale: (
         scaleType: PDFPageScaleType,
         scalePercentage?: number,
      ) => PDFPageScale;
      refreshCurrentScale: () => void;
      setPageLayout: (pageLayout: PDFPageLayout) => void;
      setPageTransition: (pageTransition: PDFPageTransition) => void;
      setVirtualizerInstance: (
         virtualizerInstance: Virtualizer<HTMLDivElement, Element>,
      ) => void;
      setScrollElement: (scrollElement: HTMLDivElement) => void;
      scrollToPage: (pageNumber: number) => void;
      updateState: (state: Partial<PDFStore>) => void;
      getCurrentOutlines: () => PDFOutline[];
   };
};

export type PDFReaderStore = {
   isSidebarOpen: boolean;
   isToolbarAlwaysVisible: boolean;
   isSideChatOpen: boolean;
   actions: {
      toggleSidebarVisibility: () => void;
      setIsToolbarAlwaysVisible: (isToolbarAlwaysVisible: boolean) => void;
      toggleSideChatVisibility: () => void;
   };
};

export const createPDFStore = (initialState: Omit<PDFStore, "actions">) => {
   return create<PDFStore>((set, get) => ({
      ...initialState,
      actions: {
         setDocumentProxy: (documentProxy: PDFDocumentProxy) =>
            set({ documentProxy }),
         setOutlines: (outlines: PDFOutline[]) => set({ outlines }),
         setNumPages: (numPages: number) => set({ numPages }),
         setCurrentPage: (currentPage: number) => set({ currentPage }),
         setBasePDFPageSize: (basePDFPageSize: PDFPageDimension) =>
            set({ basePDFPageSize }),
         changeCurrentScale: (
            scaleType: PDFPageScaleType,
            scalePercentage?: number,
         ) => {
            const newScale = get().actions.caculatePDFPageScale(
               scaleType,
               scalePercentage,
            );

            set({ currentPageScale: newScale });
         },
         refreshCurrentScale: () => {
            const currentScale = get().currentPageScale;
            const newScale = get().actions.caculatePDFPageScale(
               currentScale.scaleType,
               currentScale.scalePercentage,
            );

            set({ currentPageScale: newScale });
         },
         caculatePDFPageScale: (
            scaleType: PDFPageScaleType,
            scalePercentage?: number,
         ): PDFPageScale => {
            // Percentage scale type
            if (scaleType === "percentage") {
               if (!scalePercentage) {
                  throw new Error(
                     "Scale percentage is required when scale type is percentage",
                  );
               }

               const SCALE_PERCENTAGE_MIN = 10;
               const SCALE_PERCENTAGE_MAX = 800;

               const clampedPercentage = Math.min(
                  Math.max(scalePercentage, SCALE_PERCENTAGE_MIN),
                  SCALE_PERCENTAGE_MAX,
               );

               return {
                  scaleType,
                  scalePercentage: clampedPercentage,
               };
            }

            // Validate required state
            const { scrollElement, basePDFPageSize, currentPageLayout } = get();
            if (!scrollElement || !basePDFPageSize) {
               throw new Error(
                  `Missing scrollElement or basePDFPageSize state: scrollElement=${!!scrollElement}, basePDFPageSize=${!!basePDFPageSize}`,
               );
            }

            // Calculate total gap size
            const pageGapSize = useConfigStore.getState().config.pageGapSize;
            const isDoublePageLayout =
               currentPageLayout === "double-page" ||
               currentPageLayout === "cover-facing-page";
            const totalHorizontalGapSize = isDoublePageLayout
               ? pageGapSize * 4
               : pageGapSize * 2;
            const totalVerticalGapSize = pageGapSize * 2;

            // Calculate available space
            const viewHeight = scrollElement.offsetHeight;
            const viewWidth = scrollElement.clientWidth;
            const availableWidth = viewWidth - totalHorizontalGapSize;
            const availableHeight = viewHeight - totalVerticalGapSize;

            // Calculate scale base on scale type
            const { height: basePDFPageHeight, width: basePDFPageWidth } =
               basePDFPageSize;

            if (scaleType === "fit-height") {
               const scalePercentage =
                  (availableHeight / basePDFPageHeight) * 100;
               return {
                  scaleType,
                  scalePercentage,
               };
            }

            if (scaleType === "fit-width") {
               const availableWidthForEachPage = isDoublePageLayout
                  ? availableWidth / 2
                  : availableWidth;
               const scalePercentage =
                  (availableWidthForEachPage / basePDFPageWidth) * 100;
               return {
                  scaleType,
                  scalePercentage,
               };
            }

            // fallback
            console.error(`Invalid scale type: ${scaleType}`);
            return { scaleType: "percentage", scalePercentage: 100 };
         },
         setPageLayout: (pageLayout: PDFPageLayout) => {
            set({ currentPageLayout: pageLayout });
            get().actions.refreshCurrentScale();
         },
         setPageTransition: (pageTransition: PDFPageTransition) =>
            set({ currentPageTransition: pageTransition }),
         setVirtualizerInstance: (
            virtualizerInstance: Virtualizer<HTMLDivElement, Element>,
         ) => set({ virtualizerInstance }),
         setScrollElement: (scrollElement: HTMLDivElement) =>
            set({ scrollElement }),
         scrollToPage: (pageNumber: number) => {
            const { virtualizerInstance } = get();
            if (!virtualizerInstance) return;
            virtualizerInstance.scrollToIndex(pageNumber - 1);
         },
         updateState: (state: Partial<PDFStore>) => set(state),
         getCurrentOutlines: () => {
            const outlines = get().outlines;
            if (!outlines) return [];
            const currentPage = get().currentPage;
            return getOutlinesByPageNumber(outlines, currentPage);
         },
      },
   }));
};

function getOutlinesByPageNumber(outlines: PDFOutline[], pageNumber: number) {
   const outlinesByPageNumber: PDFOutline[] = [];
   for (const outline of outlines) {
      if (!outline.resolvedPageNumber || !outline.resolvedEndPageNumber)
         continue;
      if (
         pageNumber >= outline.resolvedPageNumber &&
         pageNumber <= outline.resolvedEndPageNumber
      ) {
         outlinesByPageNumber.push(outline);
      }
      if (outline.items.length > 0) {
         const items = getOutlinesByPageNumber(outline.items, pageNumber);
         outlinesByPageNumber.push(...items);
      }
   }
   return outlinesByPageNumber;
}

export const createPDFReaderStore = (
   initialState: Omit<PDFReaderStore, "actions">,
) => {
   return create<PDFReaderStore>((set) => ({
      ...initialState,
      actions: {
         toggleSidebarVisibility: () =>
            set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
         setIsToolbarAlwaysVisible: (isToolbarAlwaysVisible: boolean) =>
            set({ isToolbarAlwaysVisible }),
         toggleSideChatVisibility: () =>
            set((state) => ({ isSideChatOpen: !state.isSideChatOpen })),
      },
   }));
};
