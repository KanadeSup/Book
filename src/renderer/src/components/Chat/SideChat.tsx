import { BotIcon, FolderClock, Plus, Send } from "lucide-react";
import { IconButton } from "../MyButton/IconButton";
import { MyInput } from "../MyInput/MyInput";
import { createContext, useContext, useEffect, useState } from "react";
import { usePDFStore } from "../PDF/PDFProvider";
import { usePDFStoreActions } from "../PDF/PDFProvider";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { PDFOutline } from "@/types/pdf.types";
import { generateSummaryPrompt, generateText } from "@/services/ai";
import Markdown from "react-markdown";
import { ScrollArea } from "../shadcn/scroll-area";

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
   const handleOnPromptClick = async (prompt: string, message: string) => {
      const loadingMessage: Message = {
         role: "assistant",
         content: "Waiting for generate...",
      };
      const userMessage: Message = {
         role: "user",
         content: message,
      };
      setMessages([...messages, userMessage, loadingMessage]);
      const response = await generateText(prompt);
      if (response.success) {
         setMessages([
            ...messages,
            userMessage,
            { role: "assistant", content: response.data },
         ]);
         return;
      }
      setMessages([
         ...messages,
         userMessage,
         { role: "assistant", content: "Error" },
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
            {messages.length > 0 && <MessageChatSection />}
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
   onPromptClick: (prompt: string, message: string) => void;
};
function StarterSection(props: StarterSectionProps) {
   return (
      <div className="flex flex-col gap-2 p-2">
         <StarterPromptSection onPromptClick={props.onPromptClick} />
      </div>
   );
}

type StarterPromptSectionProps = {
   onPromptClick: (prompt: string, message: string) => void;
};
function StarterPromptSection(props: StarterPromptSectionProps) {
   const { getCurrentOutlines } = usePDFStoreActions();
   const { getTextContentByPageNumber } = usePDFStoreActions();
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

   const handleOnPromptClick = async (outline: PDFOutline) => {
      const chapterPage = [
         outline.resolvedPageNumber,
         outline.resolvedEndPageNumber,
      ];
      if (chapterPage[0] === undefined || chapterPage[1] === undefined) return;
      // call loop getTextContentByPageNumber
      let textContent = "";
      for (let page = chapterPage[0]; page <= chapterPage[1]; page++) {
         const text = await getTextContentByPageNumber(page);
         textContent += text + " ";
      }
      const prompt = generateSummaryPrompt("", outline.title, textContent);
      props.onPromptClick(prompt, `Summarize ${outline.title}`);
   };

   useEffect(throttledLoadOutlines, [currentPage]);
   return (
      <div className="flex flex-col gap-2 p-2 flex-wrap">
         {currentPageOutlines.map((outline) => (
            <StarterPromptCard
               key={outline.title}
               title={`Summary [${outline.title}]`}
               description={`Summarize ${outline.title}`}
               onClick={() => {
                  handleOnPromptClick(outline);
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
      <ScrollArea className="flex flex-col gap-2 p-2 h-full overflow-y-auto prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
         {messages.map((message, index) => (
            <MessageCard key={index} message={message} />
         ))}
      </ScrollArea>
   );
}

function MessageCard({ message }: { message: Message }) {
   const isAssistant = message.role === "assistant";

   return (
      <div className="border-b border-zinc-700 pb-3">
         <div className="space-y-2">
            {isAssistant && (
               <div className="flex items-center gap-2 mt-2">
                  <div className="w-10 h-10 rounded-md bg-zinc-700 flex items-center justify-center">
                     <BotIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                     <p className="font-bold text-gray-300">OpenAI</p>
                     <p className="text-sm text-gray-400"> OpenAI 4o mini</p>
                  </div>
               </div>
            )}
            <div className="prose prose-invert">
               <Markdown>{message.content}</Markdown>
            </div>
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
