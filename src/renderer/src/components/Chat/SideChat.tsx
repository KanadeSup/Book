import { FolderClock, Plus, Send } from "lucide-react";
import { IconButton } from "../MyButton/IconButton";
import { MyInput } from "../MyInput/MyInput";
import { useEffect, useState } from "react";
import { usePDFStore } from "../PDF/PDFProvider";
import { usePDFStoreActions } from "../PDF/PDFProvider";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import { PDFOutline } from "@/types/pdf.types";

export function SideChat() {
   return (
      <div className="flex flex-col w-full h-full bg-sidebar">
         <ChatHeader />
         <div className="flex flex-col gap-2 p-2">
            <StarterPromptSection />
         </div>
         <MessageInput />
      </div>
   );
}

function ChatHeader() {
   return (
      <div className="flex items-center justify-between border-b border-accent h-[41px] px-2">
         <h1 className="font-bold">Chat</h1>
         <div className="flex items-center">
            <IconButton>
               <Plus className="w-4 h-4" />
            </IconButton>
            <IconButton>
               <FolderClock className="w-4 h-4" />
            </IconButton>
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

function StarterPromptSection() {
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
               onClick={() => {}}
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
      <div className="flex items-center justify-between border border-zinc-700 rounded-md p-2 cursor-pointer hover:border-green-600 transition-all">
         <div>
            <h1 className="font-bold">{props.title}</h1>
            <p className="text-sm text-gray-400">{props.description}</p>
         </div>
      </div>
   );
}
