import { createPDFStore, PDFStore } from "@/stores/PDFStore";
import { createContext, useContext, useState } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";

type StoreHook = UseBoundStore<StoreApi<PDFStore>>;
const StoreContext = createContext<StoreHook | undefined>(undefined);

type PDFProviderProps = {
   children: React.ReactNode;
};
export default function PDFProvider(props: PDFProviderProps) {
   const [PDFStore] = useState(() =>
      createPDFStore({
         documentProxy: undefined,
         numPages: 0,
         currentPage: 0,
         basePDFPageSize: undefined,
         currentPageScale: {
            scaleType: "percentage",
            scalePercentage: 100,
         },
         currentPageLayout: "single-page",
         currentPageTransition: "continuous-page",
         viewContainer: undefined,
         pageScrollContainer: undefined,
      }),
   );
   return (
      <StoreContext.Provider value={PDFStore}>
         {props.children}
      </StoreContext.Provider>
   );
}

export type PDFStoreSelector<T> = (state: PDFStore) => T;
export const usePDFStore = function <T>(selector: PDFStoreSelector<T>): T {
   const store = useContext(StoreContext);
   if (!store) {
      throw new Error(
         "usePDFStore must be used within a PDFProvider as a child component",
      );
   }
   return useStore(store, selector);
};

export const usePDFStoreActions = () => {
   const store = useContext(StoreContext);
   if (!store) {
      throw new Error(
         "usePDFStoreActions must be used within a PDFProvider as a child component",
      );
   }
   return useStore(store, (state) => state.actions);
};
