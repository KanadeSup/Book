import { createContext, useContext, useState } from "react";
import { createPDFReaderStore, PDFReaderStore } from "@/stores/PDFStore";
import { StoreApi, UseBoundStore, useStore } from "zustand";

type StoreHook = UseBoundStore<StoreApi<PDFReaderStore>>;
const StoreContext = createContext<StoreHook | undefined>(undefined);

type PDFReaderProviderProps = {
   children: React.ReactNode;
};
export function PDFReaderProvider(props: PDFReaderProviderProps) {
   const [store] = useState(() =>
      createPDFReaderStore({
         isSidebarOpen: false,
         isToolbarAlwaysVisible: false,
      }),
   );
   return (
      <StoreContext.Provider value={store}>
         {props.children}
      </StoreContext.Provider>
   );
}

export type PDFReaderStoreSelector<T> = (state: PDFReaderStore) => T;
export const usePDFReaderStore = function <T>(
   selector: PDFReaderStoreSelector<T>,
): T {
   const store = useContext(StoreContext);
   if (!store) {
      throw new Error(
         "usePDFReaderStore must be used within a PDFReaderProvider as a child component",
      );
   }
   return useStore(store, selector);
};

export const usePDFReaderStoreActions = () => {
   const store = useContext(StoreContext);
   if (!store) {
      throw new Error(
         "usePDFReaderStoreActions must be used within a PDFReaderProvider as a child component",
      );
   }
   return useStore(store, (state) => state.actions);
};
