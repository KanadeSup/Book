import { PDFDocumentProxy } from "pdfjs-dist";
import { FixedSizeList } from "react-window";
import {
   PDFPageDimension,
   PDFPageScale,
   PDFPageLayout,
   PDFPageTransition,
   PDFPageScaleType,
} from "@/types/pdf.types";
import { create } from "zustand";

export type PDFStore = {
   documentProxy: PDFDocumentProxy | undefined;
   numPages: number;
   currentPage: number;
   basePDFPageSize: PDFPageDimension | undefined;
   currentScale: PDFPageScale;
   pageLayout: PDFPageLayout;
   pageTransition: PDFPageTransition;
   viewContainer: HTMLDivElement | undefined;
   pageScrollContainer: FixedSizeList<any> | undefined;

   actions: {
      setDocumentProxy: (documentProxy: PDFDocumentProxy) => void;
      setNumPages: (numPages: number) => void;
      setCurrentPage: (currentPage: number) => void;
      setBasePDFPageSize: (basePDFPageSize: PDFPageDimension) => void;
      changeCurrentScale: (
         scaleType: PDFPageScaleType,
         scalePercentage?: number,
      ) => void;
      setPageLayout: (pageLayout: PDFPageLayout) => void;
      setPageTransition: (pageTransition: PDFPageTransition) => void;
      setViewContainer: (viewContainer: HTMLDivElement) => void;
      setPageScrollContainer: (pageScrollContainer: FixedSizeList<any>) => void;
      scrollToPage: (pageNumber: number) => void;
      updateState: (state: Partial<PDFStore>) => void;
   };
};

export type PDFReaderStore = {
   isSidebarOpen: boolean;
   isToolbarAlwaysVisible: boolean;
   actions: {
      toggleSidebarVisibility: () => void;
      setIsToolbarAlwaysVisible: (isToolbarAlwaysVisible: boolean) => void;
   };
};

export const createPDFStore = (initialState: Omit<PDFStore, "actions">) => {
   return create<PDFStore>((set, get) => ({
      ...initialState,
      actions: {
         setDocumentProxy: (documentProxy: PDFDocumentProxy) =>
            set({ documentProxy }),
         setNumPages: (numPages: number) => set({ numPages }),
         setCurrentPage: (currentPage: number) => set({ currentPage }),
         setBasePDFPageSize: (basePDFPageSize: PDFPageDimension) =>
            set({ basePDFPageSize }),
         changeCurrentScale: (
            scaleType: PDFPageScaleType,
            scalePercentage?: number,
         ) => {
            if (scaleType === "percentage") {
               if (!scalePercentage)
                  throw new Error(
                     "Scale percentage is required when scale type is percentage",
                  );
               set({ currentScale: { scaleType, scalePercentage } });
               return;
            }

            const viewContainer = get().viewContainer;
            const basePDFPageSize = get().basePDFPageSize;
            if (!viewContainer || !basePDFPageSize)
               throw new Error(
                  "View container or base PDF page size is required",
               );
            if (scaleType === "fit-height") {
               const fitHeightScalePercentage =
                  (viewContainer.offsetHeight / basePDFPageSize.height) * 100;
               set({
                  currentScale: {
                     scaleType,
                     scalePercentage: fitHeightScalePercentage,
                  },
               });
            } else if (scaleType === "fit-width") {
               const fitWidthScalePercentage =
                  (viewContainer.clientWidth / basePDFPageSize.width) * 100;
               set({
                  currentScale: {
                     scaleType,
                     scalePercentage: fitWidthScalePercentage,
                  },
               });
            }
         },
         setPageLayout: (pageLayout: PDFPageLayout) => set({ pageLayout }),
         setPageTransition: (pageTransition: PDFPageTransition) =>
            set({ pageTransition }),
         setViewContainer: (viewContainer: HTMLDivElement) =>
            set({ viewContainer }),
         setPageScrollContainer: (pageScrollContainer: FixedSizeList<any>) =>
            set({ pageScrollContainer }),
         scrollToPage: (pageNumber: number) => {
            const { pageScrollContainer } = get();
            if (!pageScrollContainer) return;
            pageScrollContainer.scrollToItem(pageNumber - 1, "start");
         },
         updateState: (state: Partial<PDFStore>) => set(state),
      },
   }));
};

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
      },
   }));
};
