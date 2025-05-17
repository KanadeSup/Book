import { usePdfStore } from "@/stores/pdfStore";
import { PdfOutline } from "@/types/pdf.types";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Expander } from "../Expander/Expander";
import { ExpanderContent } from "../Expander/Expander";
import { cn } from "@/utils/tailwindUtils";
import { ScrollArea } from "../shadcn/scroll-area";
import { PDFDocumentProxy } from "pdfjs-dist";

export function PdfOutlineSidebar() {
   const { documentProxy, pageScrollContainer } = usePdfStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
         pageScrollContainer: state.pageScrollContainer,
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
   const handleOutlineClick = (pageIndex: number) => {
      if (!pageScrollContainer) return;
      pageScrollContainer.scrollToItem(pageIndex, "start");
   };
   return (
      <div className="h-full w-full bg-sidebar flex flex-col">
         <div className="flex items-center h-[41px] justify-center border-b border-accent shrink-0">
            <h1 className="text-gray-200 font-bold text-center tracking-wider">
               Book Outline
            </h1>
         </div>
         <ScrollArea className="flex flex-col gap-2 mt-5 px-2 overflow-auto h-full">
            {outlines.map((outline) => (
               <OutlineItem
                  key={outline.title}
                  outline={outline}
                  documentProxy={documentProxy}
                  onClick={handleOutlineClick}
               />
            ))}
         </ScrollArea>
      </div>
   );
}

type OutlineItemProps = {
   outline: PdfOutline;
   level?: number;
   documentProxy: PDFDocumentProxy | null;
   onClick?: (pageIndex: number) => void;
};
const OutlineItem = (props: OutlineItemProps) => {
   const [open, setOpen] = useState(false);
   const indentLevel = props.level ? props.level : 0;
   const handleClick = async () => {
      if (!props.documentProxy || !props.outline.dest) return;
      const pageIndex = await covertOutlineDestinationToPageIndex(
         props.outline.dest,
         props.documentProxy,
      );
      if (pageIndex === null) return;
      props.onClick?.(pageIndex);
   };
   return (
      <div
         style={{ paddingLeft: `${indentLevel * 20}px` }}
         className="select-none"
      >
         {props.outline.items.length > 0 ? (
            <Expander open={open}>
               <div className="flex items-start ">
                  <ChevronRight
                     className={cn(
                        "w-5 h-5 text-gray-300 stroke-[3px] mt-[5px]  stroke-gray-400 cursor-pointer hover:stroke-white transition-all shrink-0",
                        open ? "rotate-90" : "",
                     )}
                     onClick={() => setOpen(!open)}
                  />
                  <div
                     className="hover:bg-accent cursor-pointer p-1 px-2 rounded-md w-full"
                     onClick={handleClick}
                  >
                     <h1 className="text-gray-300 font-bold text-left ">
                        {props.outline.title}
                     </h1>
                  </div>
               </div>

               <ExpanderContent>
                  {props.outline.items.map((item) => (
                     <OutlineItem
                        key={item.title}
                        outline={item}
                        level={1}
                        documentProxy={props.documentProxy}
                        onClick={props.onClick}
                     />
                  ))}
               </ExpanderContent>
            </Expander>
         ) : (
            <div
               className="hover:bg-accent cursor-pointer p-1 px-2 rounded-md w-full transition-all"
               onClick={handleClick}
            >
               <h1 className="text-gray-300 font-bold text-left ">
                  {props.outline.title}
               </h1>
            </div>
         )}
      </div>
   );
};

const covertOutlineDestinationToPageIndex = async (
   destination: string | Array<any>,
   documentProxy: PDFDocumentProxy,
): Promise<number | null> => {
   try {
      if (typeof destination === "string") {
         const destRefArray = await documentProxy.getDestination(destination);
         if (!destRefArray || destRefArray.length === 0) return null;
         const pageIndex = await documentProxy.getPageIndex(destRefArray[0]);
         return pageIndex;
      }
      if (Array.isArray(destination) && destination.length > 0) {
         const pageIndex = await documentProxy.getPageIndex(destination[0]);
         return pageIndex;
      }
      return null;
   } catch (error) {
      console.error(
         `Error converting outline destination to page index: ${error}`,
      );
      return null;
   }
};
