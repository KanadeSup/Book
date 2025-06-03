import { BotIcon, FolderClock, Plus, Send } from "lucide-react";
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
   const handleOnPromptClick = async (text: string) => {
      const loadingMessage: Message = {
         role: "assistant",
         content: "Waiting for generate...",
      };
      const userMessage: Message = {
         role: "user",
         content: text,
      };
      setMessages([...messages, userMessage, loadingMessage]);
      const response = await new Promise((resolve) => {
         setTimeout(() => {
            resolve(text);
         }, 1000);
      });
      setMessages([
         ...messages,
         userMessage,
         { role: "assistant", content: "a" },
      ]);
      return response;
   };
   return (
      <SideChatContext.Provider value={{ messages, setMessages }}>
         <div className="flex flex-col w-full h-full bg-sidebar">
            <ChatHeader />
            {messages.length === 0 && (
               <div className="flex flex-col gap-2 p-2">
                  <StarterSection onPromptClick={handleOnPromptClick} />
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

type StarterSectionProps = {
   onPromptClick: (text: string) => void;
};
function StarterSection(props: StarterSectionProps) {
   return (
      <div className="flex flex-col gap-2 p-2">
         <StarterPromptSection onPromptClick={props.onPromptClick} />
      </div>
   );
}

type StarterPromptSectionProps = {
   onPromptClick: (text: string) => void;
};
function StarterPromptSection(props: StarterPromptSectionProps) {
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
                  props.onPromptClick(`Summarize ${outline.title}`);
               }}
            />
         ))}
      </div>
   );
}

type StarterPromptCardProps = {
   title: string;
   description: string;
   onClick: (text: string) => void;
};
function StarterPromptCard(props: StarterPromptCardProps) {
   return (
      <div
         className="flex items-center justify-between border border-zinc-700 rounded-md p-2 cursor-pointer hover:border-green-600 transition-all"
         onClick={() => props.onClick(props.title)}
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

function MessageCard({ message }: { message: Message }) {
   const isAssistant = message.role === "assistant";

   return (
      <div className="border-b border-zinc-700 pb-3">
         <div className="space-y-2">
            {isAssistant && (
               <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-md bg-zinc-700 flex items-center justify-center">
                     <BotIcon className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-gray-300">OpenAI</p>
               </div>
            )}
            <p className={isAssistant ? "text-gray-300" : ""}>
               {message.content}
            </p>
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
