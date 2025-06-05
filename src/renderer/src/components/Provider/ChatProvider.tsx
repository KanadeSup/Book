import { ChatStore, createChatStore } from "@/stores/ChatStore";
import { UseBoundStore, useStore } from "zustand";
import { createContext, useContext, useState } from "react";
import { StoreApi } from "zustand";

type StoreHook = UseBoundStore<StoreApi<ChatStore>>;
const StoreContext = createContext<StoreHook | undefined>(undefined);

type ChatProviderProps = {
   children: React.ReactNode;
};

export function ChatProvider(props: ChatProviderProps) {
   const [ChatStore] = useState(() =>
      createChatStore({
         isLoading: false,
         messages: [],
      }),
   );

   return (
      <StoreContext.Provider value={ChatStore}>
         {props.children}
      </StoreContext.Provider>
   );
}

export type ChatStoreSelector<T> = (state: ChatStore) => T;
export const useChatStore = function <T>(selector: ChatStoreSelector<T>): T {
   const store = useContext(StoreContext);
   if (!store) {
      throw new Error(
         "useChatStore must be used within a ChatProvider as a child component",
      );
   }
   return useStore(store, selector);
};

export const useChatStoreActions = () => {
   const store = useContext(StoreContext);
   if (!store) {
      throw new Error(
         "useChatStoreActions must be used within a ChatProvider as a child component",
      );
   }
   return useStore(store, (state) => state.actions);
};
