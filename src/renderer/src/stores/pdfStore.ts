import { create } from "zustand";
import { PDFDocumentProxy } from "pdfjs-dist";
import { FixedSizeList } from "react-window";
import { debounce } from "lodash";
import { subscribeWithSelector } from "zustand/middleware";

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
   loadSavedState: () => void;
};
export const usePdfStore = create<PdfStore>()(
   subscribeWithSelector((set) => ({
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
         set((currentState) => ({
            state: { ...currentState.state, ...state },
         }));
      },
      setPageScrollContainer: (pageScrollContainer) =>
         set({ pageScrollContainer }),
      loadSavedState: () => {
         const path = window.location.pathname;
         if (!path.includes("books")) return;
         if (!(path.split("/").length > 2)) return;
         const bookId = path.split("/")[2];
         if (!bookId) return;
         const state = localStorage.getItem(`PDF_STATE_${bookId}`);
         if (!state) return;
         const parsedState = JSON.parse(state) as SaveState;
         set((currentState) => ({
            state: { ...currentState.state, ...parsedState },
         }));
      },
   })),
);

type SaveState = {
   currentPage: number;
   viewControl: PdfStore["state"]["viewControl"];
};
const saveState = debounce((state: SaveState) => {
   const path = window.location.pathname;
   if (!path.includes("books")) return;
   if (!(path.split("/").length > 2)) return;
   const bookId = path.split("/")[2];
   if (!bookId) return;
   localStorage.setItem(`PDF_STATE_${bookId}`, JSON.stringify(state));
}, 1000);

usePdfStore.subscribe(
   (state) => ({
      currentPage: state.state.currentPage,
      viewControl: state.state.viewControl,
      currentScale: state.state.currentScale,
   }),
   saveState,
   {
      equalityFn: (prev, next) => {
         return (
            prev.currentPage === next.currentPage &&
            prev.viewControl === next.viewControl &&
            prev.currentScale === next.currentScale
         );
      },
   },
);
