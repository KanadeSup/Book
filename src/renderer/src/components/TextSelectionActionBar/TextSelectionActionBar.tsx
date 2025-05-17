import { Languages, Loader2, ScanSearch } from "lucide-react";
import { useEffect, useImperativeHandle, useState } from "react";
import { IconButton } from "../MyButton/IconButton";
import { translateText } from "@/services/ai";

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
   const [selectedText, setSelectedText] = useState<string | null>(null);
   const [position, setPosition] = useState<{ x: number; y: number } | null>(
      null,
   );
   const [isTranslateOpen, setIsTranslateOpen] = useState(false);
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
               setIsTranslateOpen(false);
            }
         },
         isOpen: !!selectedText && !!position,
      };
   });
   if (!position) return null;
   return (
      <div
         className="fixed select-none p-1 rounded border border-gray-500 bg-background"
         style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
         {isTranslateOpen ? (
            <TranslateModal text={selectedText} />
         ) : (
            <ActionBar setIsTranslateOpen={setIsTranslateOpen} />
         )}
      </div>
   );
};

type ActionBarProps = {
   setIsTranslateOpen: (isTranslateOpen: boolean) => void;
};
const ActionBar = ({ setIsTranslateOpen }: ActionBarProps) => {
   const actionItems = [
      {
         label: "Translate",
         icon: Languages,
         onClick: () => {
            setIsTranslateOpen(true);
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
   return (
      <div className="flex gap-1">
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

type TranslateModalProps = {
   text?: string | null;
};
const TranslateModal = ({ text }: TranslateModalProps) => {
   const [translation, setTranslation] = useState<{
      word: string;
      definition: string;
      examples: string[];
      vnTranslations: string[];
   } | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   useEffect(() => {
      if (!text) return;
      const translate = async () => {
         setIsLoading(true);
         const result = await translateText(text);
         if (result.success) {
            setTranslation(result.data);
         }
         setIsLoading(false);
      };
      translate();
   }, [text]);
   return (
      <div className="max-w-[500px] min-w-[300px] p-2">
         {isLoading ? (
            <div className="flex justify-center items-center h-[100px]">
               <Loader2 className="w-4 h-4 animate-spin" />
            </div>
         ) : (
            <div>
               <h1 className="text-lg font-bold text-center">
                  {translation?.word}
               </h1>
               <div className="text-gray-300">
                  <div className="">
                     <h2 className="font-bold">Definition:</h2>
                     <p className="text-sm indent-3.5 text-wrap">
                        {translation?.definition}
                     </p>
                  </div>
                  <div className="">
                     <h2 className="font-bold">Examples:</h2>
                     <div className="prose prose-invert text-wrap">
                        <ul>
                           {translation?.examples.map((example) => (
                              <li className="text-sm">{example}</li>
                           ))}
                        </ul>
                     </div>
                  </div>
                  <div className="">
                     <h2 className="font-bold">Vietnamese:</h2>
                     <p className="text-sm indent-3.5 text-wrap">
                        {translation?.vnTranslations.join(", ")}
                     </p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
