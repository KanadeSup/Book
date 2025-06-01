import { FolderClock, Plus, Send } from "lucide-react";
import { IconButton } from "../MyButton/IconButton";
import { MyInput } from "../MyInput/MyInput";
import { createContext, useContext, useEffect, useState } from "react";
import { usePDFStore } from "../PDF/PDFProvider";
import { usePDFStoreActions } from "../PDF/PDFProvider";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { PDFOutline } from "@/types/pdf.types";

type SideChatContextType = {
   messages: Message[];
   setMessages: (messages: Message[]) => void;
};
type Message = {
   role: "user" | "assistant";
   content: string;
};
const SideChatContext = createContext<SideChatContextType>({
   messages: [],
   setMessages: () => {},
});

export function SideChat() {
   const [messages, setMessages] = useState<Message[]>([]);
   return (
      <SideChatContext.Provider value={{ messages, setMessages }}>
         <div className="flex flex-col w-full h-full bg-sidebar">
            <ChatHeader />
            {messages.length === 0 && (
               <div className="flex flex-col gap-2 p-2">
                  <StarterSection />
               </div>
            )}
            {messages.length > 0 && (
               <div className="flex flex-col gap-2 p-2">
                  <MessageChatSection />
               </div>
            )}
            <MessageInput />
         </div>
      </SideChatContext.Provider>
   );
}

function ChatHeader() {
   const { setMessages } = useContext(SideChatContext);
   return (
      <div className="flex items-center justify-between border-b border-accent h-[41px] px-2">
         <h1 className="font-bold">Chat</h1>
         <div className="flex items-center">
            <IconButton
               onClick={() => {
                  setMessages([]);
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

function StarterSection() {
   return (
      <div className="flex flex-col gap-2 p-2">
         <StarterPromptSection />
      </div>
   );
}

function StarterPromptSection() {
   const { messages, setMessages } = useContext(SideChatContext);
   const { getCurrentOutlines } = usePDFStoreActions();
   const { currentPage } = usePDFStore(
      useShallow((state) => ({
         currentPage: state.currentPage,
      })),
   );
   const [currentPageOutlines, setCurrentPageOutlines] = useState<PDFOutline[]>(
      [],
   );

   const [throttledLoadOutlines] = useState(() => {
      return _.throttle(
         () => {
            const outlines = getCurrentOutlines();
            setCurrentPageOutlines(outlines);
         },
         1000,
         { trailing: true, leading: false },
      );
   });

   useEffect(throttledLoadOutlines, [currentPage]);
   return (
      <div className="flex flex-col gap-2 p-2 flex-wrap">
         {currentPageOutlines.map((outline) => (
            <StarterPromptCard
               key={outline.title}
               title={`Summary [${outline.title}]`}
               description={`Summarize ${outline.title}`}
               onClick={() => {
                  setMessages([
                     ...messages,
                     { role: "user", content: `Summarize ${outline.title}` },
                  ]);
               }}
            />
         ))}
      </div>
   );
}

type StarterPromptCardProps = {
   title: string;
   description: string;
   onClick: () => void;
};
function StarterPromptCard(props: StarterPromptCardProps) {
   return (
      <div
         className="flex items-center justify-between border border-zinc-700 rounded-md p-2 cursor-pointer hover:border-green-600 transition-all"
         onClick={props.onClick}
      >
         <div>
            <h1 className="font-bold">{props.title}</h1>
            <p className="text-sm text-gray-400">{props.description}</p>
         </div>
      </div>
   );
}

function MessageChatSection() {
   const { messages } = useContext(SideChatContext);
   return (
      <div className="flex flex-col gap-2 p-2">
         {messages.map((message, index) => (
            <MessageCard key={index} message={message} />
         ))}
      </div>
   );
}

function MessageCard(props: { message: Message }) {
   return (
      <div className="flex items-center justify-between border border-zinc-700 rounded-md p-2 cursor-pointer hover:border-green-600 transition-all">
         <div>
            <h1 className="font-bold">{props.message.content}</h1>
         </div>
      </div>
   );
}

function MessageInput() {
   return (
      <div className="flex flex-col gap-2 mt-auto p-2">
         <div className="flex items-center gap-1">
            <MyInput
               placeholder="Enter a message"
               className="w-full p-2 rounded-md"
            />
            <IconButton className="w-9 h-9">
               <Send className="w-4 h-4" />
            </IconButton>
         </div>
      </div>
   );
}
