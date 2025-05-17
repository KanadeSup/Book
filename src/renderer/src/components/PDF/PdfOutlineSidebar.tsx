import { usePdfStore } from "@/stores/pdfStore";
import { PdfOutline } from "@/types/pdf.types";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Expander } from "../Expander/Expander";
import { ExpanderContent } from "../Expander/Expander";
import { cn } from "@/utils/tailwindUtils";
import { ScrollArea } from "../shadcn/scroll-area";

export function PdfOutlineSidebar() {
   const { documentProxy } = usePdfStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
      })),
   );
   const [outlines, setOutlines] = useState<PdfOutline[]>([]);
   useEffect(() => {
      if (!documentProxy) return;
      const loadOutline = async () => {
         const documentOutlines = await documentProxy.getOutline();
         setOutlines(documentOutlines);
      };
      loadOutline();
   }, [documentProxy]);
   return (
      <div className="h-full w-full bg-sidebar flex flex-col">
         <div className="flex items-center h-[41px] justify-center border-b border-accent shrink-0">
            <h1 className="text-gray-200 font-bold text-center tracking-wider">
               Book Outline
            </h1>
         </div>
         <ScrollArea className="flex flex-col gap-2 mt-5 px-2 overflow-auto h-full">
            {outlines.map((outline) => (
               <OutlineItem key={outline.title} outline={outline} />
            ))}
         </ScrollArea>
      </div>
   );
}

const OutlineItem = ({
   outline,
   level,
}: {
   outline: PdfOutline;
   level?: number;
}) => {
   const [open, setOpen] = useState(false);
   const indentLevel = level ? level : 0;
   return (
      <div
         style={{ paddingLeft: `${indentLevel * 20}px` }}
         className="select-none"
      >
         {outline.items.length > 0 ? (
            <Expander open={open}>
               <div className="flex items-start ">
                  <ChevronRight
                     className={cn(
                        "w-5 h-5 text-gray-300 stroke-[3px] mt-[5px]  stroke-gray-400 cursor-pointer hover:stroke-white transition-all shrink-0",
                        open ? "rotate-90" : "",
                     )}
                     onClick={() => setOpen(!open)}
                  />
                  <div className="hover:bg-accent cursor-pointer p-1 px-2 rounded-md w-full">
                     <h1 className="text-gray-300 font-bold text-left ">
                        {outline.title}
                     </h1>
                  </div>
               </div>

               <ExpanderContent>
                  {outline.items.map((item) => (
                     <OutlineItem key={item.title} outline={item} level={1} />
                  ))}
               </ExpanderContent>
            </Expander>
         ) : (
            <div className="hover:bg-accent cursor-pointer p-1 px-2 rounded-md w-full transition-all">
               <h1 className="text-gray-300 font-bold text-left ">
                  {outline.title}
               </h1>
            </div>
         )}
      </div>
   );
};
