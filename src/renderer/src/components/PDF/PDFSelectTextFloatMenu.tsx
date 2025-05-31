import {
   BotMessageSquare,
   Copy,
   Languages,
   RotateCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "../shadcn/skeleton";
import { IconButton } from "../MyButton/IconButton";

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
         className="absolute top-0 left-0 bg-background p-2 rounded-md"
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
   return (
      <div className="min-w-[400px] min-h-[300px] px-2 space-y-2">
         <div className="flex justify-between items-center">
            <div></div>
            <h1 className="text-lg font-bold">
               <p>{selectedText}</p>
            </h1>
            <IconButton className="">
               <RotateCw className="w-4 h-4" />
            </IconButton>
         </div>
         <div>
            <h2 className="font-bold"> Definition: </h2>
            <div className="flex flex-col gap-2">
               <Skeleton className="w-4/5 h-5 rounded-sm" />
               <Skeleton className="w-3/5 h-5 rounded-sm" />
            </div>
         </div>
         <div>
            <h2 className="font-bold"> Example: </h2>
            <div className="flex flex-col gap-2">
               <Skeleton className="w-4/5 h-5 rounded-sm" />
               <Skeleton className="w-3/5 h-5 rounded-sm" />
               <Skeleton className="w-[90%] h-5 rounded-sm" />
               <Skeleton className="w-[30%] h-5 rounded-sm" />
            </div>
         </div>
         <div>
            <h2 className="font-bold"> Translate: </h2>
            <div className="flex flex-col gap-2">
               <Skeleton className="w-4/5 h-5 rounded-sm" />
            </div>
         </div>
      </div>
   );
}
