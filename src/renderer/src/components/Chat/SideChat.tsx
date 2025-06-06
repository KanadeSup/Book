import { FolderClock, Plus } from "lucide-react";
import { IconButton } from "../MyButton/IconButton";
import { StarterPane } from "./StarterPane";
import { MessageInput } from "./MessageInput";
import { useChatStore, useChatStoreActions } from "../Provider/ChatProvider";
import { useShallow } from "zustand/react/shallow";
import { MessageList } from "./MessageList";

export function SideChat() {
   const { messages } = useChatStore(
      useShallow((state) => ({
         messages: state.messages,
         isLoading: state.isLoading,
      })),
   );
   return (
      <div className="flex flex-col w-full h-full bg-gradient-to-r from-[#141619] to-[#191f1f]">
         <ChatHeader />
         {messages.length === 0 ? (
            <div className="h-full px-5 py-2">
               <StarterPane />
            </div>
         ) : (
            <div className="h-full py-2 max-h-full overflow-y-auto dark-lean-scrollbar">
               <MessageList messages={messages} className="px-5" />
            </div>
         )}
         <div className="mt-auto mb-2 px-4 py-2">
            <MessageInput />
         </div>
      </div>
   );
}

function ChatHeader() {
   const { newChat } = useChatStoreActions();
   return (
      <div className="flex items-center justify-between border-b border-accent h-[51px] px-2 pl-4">
         <h1 className="font-bold">Chat</h1>
         <div className="flex items-center">
            <IconButton
               onClick={() => {
                  newChat();
               }}
            >
               <Plus className="w-4 h-4" />
            </IconButton>
            <IconButton>
               <FolderClock className="w-4 h-4" />
            </IconButton>
         </div>
      </div>
   );
}
