import {
   BotMessageSquare,
   Copy,
   Languages,
   Loader2,
   RotateCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "../shadcn/skeleton";
import { IconButton } from "../MyButton/IconButton";
import { translateText, TranslateDefinition } from "@/services/ai";
import { ScrollArea } from "../shadcn/scroll-area";

type PDFSelectTextFloatMenuProps = {
   selectedText: string;
   mousePosition: { x: number; y: number };
   isOpen: boolean;
};
export function PDFSelectTextFloatMenu({
   selectedText,
   mousePosition,
   isOpen,
}: PDFSelectTextFloatMenuProps) {
   const [currentModal, setCurrentModal] = useState<
      "translate" | "explain" | "copy" | "toolbar"
   >("toolbar");
   useEffect(() => {
      if (!isOpen) {
         setCurrentModal("toolbar");
      }
   }, [isOpen]);
   const items = [
      {
         label: "Translate",
         icon: Languages,
         onClick: () => {
            setCurrentModal("translate");
         },
      },
      {
         label: "Explain",
         icon: BotMessageSquare,
         onClick: () => {},
      },
      {
         label: "Copy",
         icon: Copy,
         onClick: () => {},
      },
   ];

   return (
      <div
         className="absolute top-0 left-0 bg-background p-2 rounded-md z-10"
         style={{
            top: mousePosition.y,
            left: mousePosition.x,
            display: isOpen ? "block" : "none",
         }}
      >
         {currentModal === "toolbar" && <Toolbar items={items} />}
         {currentModal === "translate" && (
            <TranslateModal selectedText={selectedText} />
         )}
      </div>
   );
}

type ToolbarProps = {
   items: { label: string; icon: React.ElementType; onClick: () => void }[];
};
function Toolbar({ items }: ToolbarProps) {
   return (
      <div className="flex items-center justify-center">
         {items.map((item) => (
            <button
               key={item.label}
               className="bg-background p-2 rounded-md hover:bg-zinc-700 cursor-pointer"
               onClick={item.onClick}
            >
               <item.icon className="w-4 h-4" />
            </button>
         ))}
      </div>
   );
}

type TranslateModalProps = {
   selectedText: string;
};
function TranslateModal({ selectedText }: TranslateModalProps) {
   const [definition, setDefinition] = useState<TranslateDefinition | null>(
      null,
   );
   const [isRefreshing, setIsRefreshing] = useState(false);
   useEffect(() => {
      translateText(selectedText).then((res) => {
         setDefinition(res.data);
      });
   }, [selectedText]);
   const refreshDefinition = () => {
      setIsRefreshing(true);
      translateText(selectedText).then((res) => {
         setDefinition(res.data);
         setIsRefreshing(false);
      });
   };
   return (
      <div>
         <div className="flex justify-between items-center">
            <div></div>
            <h1 className="text-lg font-bold">
               <p>{definition?.word}</p>
            </h1>
            {isRefreshing ? (
               <div className="flex w-8 h-8 items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
               </div>
            ) : (
               <IconButton className="">
                  <RotateCw
                     className="w-4 h-4"
                     onClick={() => {
                        refreshDefinition();
                     }}
                  />
               </IconButton>
            )}
         </div>
         <ScrollArea className="h-[400px] px-2 w-[400px] leading-5">
            <div className="space-y-2">
               <div className="">
                  <h2 className="font-bold"> Definition: </h2>
                  {definition && (
                     <div className="flex flex-col gap-2 text-gray-300">
                        <p>{definition.definition}</p>
                     </div>
                  )}
                  {!definition && (
                     <div className="flex flex-col gap-2">
                        <Skeleton className="w-4/5 h-5 rounded-sm" />
                        <Skeleton className="w-3/5 h-5 rounded-sm" />
                     </div>
                  )}
               </div>
               <div className="">
                  <h2 className="font-bold"> Example: </h2>
                  {definition && (
                     <div className="">
                        <ul className="flex flex-col gap-1 text-gray-300 list-disc list-inside break-words">
                           {definition.examples.map((example) => (
                              <li key={example}>{example}</li>
                           ))}
                        </ul>
                     </div>
                  )}
                  {!definition && (
                     <div className="flex flex-col gap-2">
                        <ul className="flex flex-col gap-1 text-gray-300 list-disc list-inside">
                           <Skeleton className="w-[80%] h-7 rounded-sm" />
                           <Skeleton className="w-[60%] h-7 rounded-sm" />
                           <Skeleton className="w-[90%] h-7 rounded-sm" />
                           <Skeleton className="w-[100%] h-7 rounded-sm" />
                           <Skeleton className="w-[30%] h-7 rounded-sm" />
                           <Skeleton className="w-[50%] h-7 rounded-sm" />
                        </ul>
                     </div>
                  )}
               </div>
               <div>
                  <h2 className="font-bold"> Translate: </h2>
                  {definition && (
                     <div className="flex flex-col gap-2 text-gray-300">
                        {definition.vnTranslations.join(", ")}
                     </div>
                  )}
                  {!definition && (
                     <div className="flex flex-col gap-2">
                        <Skeleton className="w-4/5 h-5 rounded-sm" />
                     </div>
                  )}
               </div>
            </div>
         </ScrollArea>
      </div>
   );
}
