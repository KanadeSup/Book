import { Languages, ScanSearch } from "lucide-react";
import { useImperativeHandle, useState } from "react";
import { IconButton } from "../MyButton/IconButton";

export type TextSelectionActionBarProps = {
   ref?: React.RefObject<{
      setOpen: (
         open: boolean,
         position: { x: number; y: number },
         selectedText: string,
      ) => void;
      isOpen: boolean;
   } | null>;
};
export const TextSelectionActionBar = (props: TextSelectionActionBarProps) => {
   const actionItems = [
      {
         label: "Translate",
         icon: Languages,
         onClick: () => {
            console.log("translate");
         },
      },
      {
         label: "Explain",
         icon: ScanSearch,
         onClick: () => {
            console.log("explain");
         },
      },
   ];
   const [selectedText, setSelectedText] = useState<string | null>(null);
   const [position, setPosition] = useState<{ x: number; y: number } | null>(
      null,
   );
   useImperativeHandle(props.ref, () => {
      return {
         setOpen: (
            open: boolean,
            position?: { x: number; y: number },
            selectedText?: string,
         ) => {
            if (open) {
               setSelectedText(selectedText ?? null);
               setPosition(position ?? null);
            } else {
               setSelectedText(null);
               setPosition(null);
            }
         },
         isOpen: !!selectedText && !!position,
      };
   });
   if (!position) return null;
   return (
      <div
         className="fixed select-none p-1 rounded border border-gray-500 bg-background flex gap-1"
         style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
         {actionItems.map((item) => (
            <IconButton
               key={item.label}
               className="flex items-center gap-2 shrink-0 hover:bg-stone-700"
               onClick={item.onClick}
            >
               <item.icon className="w-4 h-4" />
            </IconButton>
         ))}
      </div>
   );
};
