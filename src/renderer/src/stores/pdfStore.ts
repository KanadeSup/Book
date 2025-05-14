import { create } from "zustand";
import { PDFDocumentProxy } from "pdfjs-dist";

export type PdfStore = {
   documentProxy: PDFDocumentProxy | null;
   setDocumentProxy: (documentProxy: PDFDocumentProxy) => void;
   state: {
      numPages: number;
      currentPage: number;
      originalDimension?: {
         width: number;
         height: number;
      };
   };
   setPdfState: (state: Partial<PdfStore["state"]>) => void;
};
export const usePdfStore = create<PdfStore>((set) => ({
   documentProxy: null,
   state: {
      numPages: 0,
      currentPage: 1,
   },
   setDocumentProxy: (documentProxy) => set({ documentProxy }),
   setPdfState: (state) => {
      set((currentState) => ({ state: { ...currentState.state, ...state } }));
   },
}));
