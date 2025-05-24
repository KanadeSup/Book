import { usePDFStore, usePDFStoreActions } from "./PDFProvider";
import { PdfOutline } from "@/types/pdf.types";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Expander } from "../Expander/Expander";
import { ExpanderContent } from "../Expander/Expander";
import { cn } from "@/utils/tailwindUtils";
import { ScrollArea } from "../shadcn/scroll-area";
import { PDFDocumentProxy } from "pdfjs-dist";

export function PDFOutlineSidebar() {
   const { documentProxy, pageLayout, currentPage } = usePDFStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
         pageLayout: state.pageLayout,
         currentPage: state.currentPage,
      })),
   );
   const { scrollToPage } = usePDFStoreActions();
   const [outlines, setOutlines] = useState<PdfOutline[]>([]);
   useEffect(() => {
      if (!documentProxy) return;
      const loadOutline = async () => {
         const documentOutlines = await documentProxy.getOutline();
         await resolvePageNumberOutlines(documentOutlines, documentProxy);
         await resolveEndPageNumberOutlines(
            documentOutlines,
            documentProxy,
            documentProxy.numPages,
         );
         setOutlines(documentOutlines);
      };
      loadOutline();
   }, [documentProxy]);
   const handleOutlineClick = (pageIndex: number) => {
      const navigatePage = pageIndex + 1;
      if (pageLayout === "single-page") {
         scrollToPage(navigatePage);
         return;
      }
      if (pageLayout === "double-page") {
         const navigatePage = Math.floor(pageIndex / 2);
         scrollToPage(navigatePage);
         return;
      }
      if (pageLayout === "cover-facing-page") {
         scrollToPage(navigatePage === 1 ? 1 : Math.ceil(navigatePage / 2));
         return;
      }
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
                  currentPage={currentPage}
               />
            ))}
         </ScrollArea>
      </div>
   );
}

type OutlineItemProps = {
   outline: PdfOutline;
   level?: number;
   documentProxy?: PDFDocumentProxy;
   onClick?: (pageIndex: number) => void;
   currentPage: number;
};
const OutlineItem = (props: OutlineItemProps) => {
   const [open, setOpen] = useState(false);
   const indentLevel = props.level ? props.level : 0;
   const handleClick = async () => {
      if (!props.documentProxy || !props.outline.resolvedPageNumber) return;
      const navigateIndex = props.outline.resolvedPageNumber - 1;
      props.onClick?.(navigateIndex);
   };
   const isCurrentPage =
      props.outline.resolvedEndPageNumber &&
      props.outline.resolvedPageNumber &&
      props.currentPage >= props.outline.resolvedPageNumber &&
      props.currentPage <= props.outline.resolvedEndPageNumber;
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
                     <h1
                        className={cn(
                           "text-gray-300 font-bold text-left",
                           isCurrentPage ? "text-[#FF7551]" : "",
                        )}
                     >
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
                        currentPage={props.currentPage}
                     />
                  ))}
               </ExpanderContent>
            </Expander>
         ) : (
            <div
               className="hover:bg-accent cursor-pointer p-1 px-2 rounded-md w-full transition-all"
               onClick={handleClick}
            >
               <h1
                  className={cn(
                     "text-gray-300 font-bold text-left",
                     isCurrentPage ? "text-[#FF7551]" : "",
                  )}
               >
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

// Resolve the destination of outlines to get the page number of the outline
const resolvePageNumberOutlines = async (
   outlines: PdfOutline[],
   documentProxy: PDFDocumentProxy,
) => {
   for (const outline of outlines) {
      if (outline.items.length > 0) {
         await resolvePageNumberOutlines(outline.items, documentProxy);
      }
      if (!outline.dest) continue;
      const pageIndex = await covertOutlineDestinationToPageIndex(
         outline.dest,
         documentProxy,
      );
      if (pageIndex === null) continue;
      outline.resolvedPageNumber = pageIndex + 1;
   }
};

const resolveEndPageNumberOutlines = async (
   outlines: PdfOutline[],
   documentProxy: PDFDocumentProxy,
   maxPageNumber: number | null,
) => {
   const lastOutline = outlines[outlines.length - 1];
   if (maxPageNumber) {
      lastOutline.resolvedEndPageNumber =
         lastOutline.resolvedPageNumber === maxPageNumber
            ? maxPageNumber
            : maxPageNumber - 1;
   }
   for (let i = 0; i < outlines.length - 1; i++) {
      const outline = outlines[i];
      if (!outline.dest) continue;
      const nextOutline = outlines[i + 1];
      if (outline.items.length > 0) {
         await resolveEndPageNumberOutlines(
            outline.items,
            documentProxy,
            nextOutline.resolvedPageNumber ?? null,
         );
      }
      if (!nextOutline.resolvedPageNumber) continue;
      if (nextOutline.resolvedPageNumber === outline.resolvedPageNumber) {
         outline.resolvedEndPageNumber = nextOutline.resolvedPageNumber;
      } else {
         outline.resolvedEndPageNumber = nextOutline.resolvedPageNumber - 1;
      }
   }
};
