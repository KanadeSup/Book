import { getTemplateByType, promptTemplates } from "@/services/promptTemplate";
import { SpecialPromptType } from "@/types/chat.types";
import { ArrowLeft, BotIcon, TableOfContents } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../MyButton/IconButton";
import { usePDFStore } from "../PDF/PDFProvider";
import { usePDFStoreActions } from "../PDF/PDFProvider";
import _ from "lodash";
import { PDFOutline } from "@/types/pdf.types";
import { useChatStoreActions } from "../Provider/ChatProvider";

export function StarterPane() {
   const [selectedPromptType, setSelectedPromptType] =
      useState<SpecialPromptType | null>(null);
   const { getTextContentByPageNumber } = usePDFStoreActions();
   const { sendMessage } = useChatStoreActions();

   const handleSelectChapter = async (outline: PDFOutline) => {
      if (!selectedPromptType) return;

      const fromPage = outline.resolvedPageNumber;
      const toPage = outline.resolvedEndPageNumber;
      if (!fromPage || !toPage) return;
      let chapterContent = "";
      for (let page = fromPage; page <= toPage; page++) {
         chapterContent += await getTextContentByPageNumber(page);
      }
      const template = getTemplateByType(selectedPromptType);
      const prompt = template.generatePrompt({
         bookName: "Unknown",
         chapterName: outline.title,
         content: chapterContent,
      });
      const messageContent = template.generateMessage({
         title: outline.title,
      });
      sendMessage(messageContent, prompt);
   };

   return (
      <div className="h-full w-full">
         <AnimatePresence>
            {!selectedPromptType ? (
               <motion.div
                  key="starter-pane"
                  className="p-2 h-full flex flex-col"
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
               >
                  <SelectPromptTypes onPromptTypeClick={setSelectedPromptType} />
                  <IntroductionBanner />
               </motion.div>
            ) : (
               <motion.div
                  key="starter-pane2"
                  className="p-2 h-full"
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
               >
                  <SelectChapter
                     onClose={() => {
                        setSelectedPromptType(null);
                        setSelectedPromptType(null);
                     }}
                     onChapterClick={handleSelectChapter}
                  />
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

type PromptTypesProps = {
   onPromptTypeClick?: (type: SpecialPromptType) => void;
};
function SelectPromptTypes({ onPromptTypeClick }: PromptTypesProps) {
   return (
      <div className="flex flex-col gap-4">
         <h3 className="font-semibold text-gray-300">Special prompts</h3>
         <div className="flex flex-col gap-2">
            {promptTemplates.map((template) => (
               <div
                  key={template.type}
                  className="border border-gray-600 py-2 px-4 rounded-md cursor-pointer hover:scale-105 transition-all hover:border-[#cb8383] duration-300"
                  onClick={() => onPromptTypeClick?.(template.type)}
               >
                  <div className="flex items-center gap-2">
                     <template.icon className="size-4 text-gray-200" />
                     <h3 className="text font-semibold text-gray-300">
                        {template.title}
                     </h3>
                  </div>
                  <p className="text-sm text-gray-300">
                     {template.description}
                  </p>
               </div>
            ))}
         </div>
      </div>
   );
}

function IntroductionBanner() {
   return (
      <div className="flex flex-col gap-2 items-center h-full justify-center">
         <BotIcon className="w-12 h-12 text-gray-400" />
         <h1 className="text-2xl font-extrabold bg-gradient-to-l from-[#b0a7c7] to-[#c3686e] inline-block text-transparent bg-clip-text">
            Chat with your PDF
         </h1>
         <p className="text-sm text-gray-400 text-center">
            Ask questions about your PDF and get answers from the AI.
         </p>
      </div>
   );
}

type SelectChapterProps = {
   onClose?: () => void;
   onChapterClick?: (outline: PDFOutline) => void;
};
function SelectChapter({
   onClose: onCloseClick,
   onChapterClick,
}: SelectChapterProps) {
   const currentPage = usePDFStore((state) => state.currentPage);
   const { getCurrentOutlines } = usePDFStoreActions();
   const [outlines, setOutlines] = useState<PDFOutline[]>([]);
   const throttleHandleCurrentPageChange = useRef(
      _.throttle(() => {
         const outlines = getCurrentOutlines();
         setOutlines(outlines);
      }, 1000),
   );
   useEffect(() => {
      throttleHandleCurrentPageChange.current();
   }, [currentPage]);
   return (
      <div className="flex flex-col gap-2 items-center h-full">
         <div className="flex w-full justify-between items-center">
            <IconButton onClick={onCloseClick}>
               <ArrowLeft className="w-4 h-4 text-gray-200" />
            </IconButton>
            <h1 className="text-xl font-extrabold bg-gradient-to-l from-[#b0a7c7] to-[#c3686e] inline-block text-transparent bg-clip-text">
               Select Chapter
            </h1>
            <div className="w-8">
               {/* This div is used for make h1 in center */}
            </div>
         </div>
         <div className="flex flex-col gap-2 w-full">
            {outlines.map((outline) => (
               <div
                  className="flex items-center border border-zinc-700 rounded-md p-3 cursor-pointer transition-all duration-300 hover:border-[#cb8383] hover:text-[#cb8383]"
                  onClick={() => onChapterClick?.(outline)}
               >
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2">
                        <TableOfContents className="w-4 h-4 text-gray-200" />
                        <h3 className="font-semibold text-sm">
                           {outline.title}
                        </h3>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
