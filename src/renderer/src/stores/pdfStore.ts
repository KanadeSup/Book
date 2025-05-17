import { create } from "zustand";
import { PDFDocumentProxy } from "pdfjs-dist";
import { FixedSizeList } from "react-window";

export type PageTransitionView = "continuous-page" | "page-by-page";
export type PageLayoutView =
   | "single-page"
   | "double-page"
   | "cover-facing-page";

export type PdfStore = {
   documentProxy: PDFDocumentProxy | null;
   setDocumentProxy: (documentProxy: PDFDocumentProxy) => void;
   pageScrollContainer: FixedSizeList<any> | null;
   state: {
      numPages: number;
      currentPage: number;
      originalDimension?: {
         width: number;
         height: number;
      };
      currentScale: {
         scaleValue?: number;
         scaleType: "fit-width" | "fit-height" | "percentage";
      };
      viewControl: {
         pageTransition: PageTransitionView;
         pageLayout: PageLayoutView;
      };
   };
   setPdfState: (state: Partial<PdfStore["state"]>) => void;
   setPageScrollContainer: (pageScrollContainer: FixedSizeList<any>) => void;
};
export const usePdfStore = create<PdfStore>((set) => ({
   documentProxy: null,
   pageScrollContainer: null,
   state: {
      numPages: 0,
      currentPage: 1,
      currentScale: {
         scaleType: "fit-height",
      },
      viewControl: {
         pageTransition: "continuous-page",
         pageLayout: "single-page",
      },
   },
   setDocumentProxy: (documentProxy) => set({ documentProxy }),
   setPdfState: (state) => {
      set((currentState) => ({ state: { ...currentState.state, ...state } }));
   },
   setPageScrollContainer: (pageScrollContainer) =>
      set({ pageScrollContainer }),
}));
