import { Link } from "@tanstack/react-router";
import PDFProvider, { usePDFStore, usePDFStoreActions } from "./PDFProvider";
import { usePDFDocument } from "@/hooks/usePDFDocument";
import { useEffect } from "react";
import { PDFReaderProvider, usePDFReaderStore } from "./PDFReaderProvider";
import { PDFViewer } from "./PDFViewer";
import { PDFToolbar } from "./PDFToolbar";
import { PDFOutlineSidebar } from "./PDFOutlineSidebar";
import { useShallow } from "zustand/react/shallow";
import { SideChat } from "../Chat/SideChat";
import { TogglePanel } from "../TogglePanel/TogglePanel";
import { PDFOutline } from "@/types/pdf.types";
import { PDFDocumentProxy } from "pdfjs-dist";
export type PDFReaderProps = {
   documentPath: string;
};
export default function PDFReader(props: PDFReaderProps) {
   return (
      <Provider documentPath={props.documentPath}>
         <PDFDocumentLoader documentPath={props.documentPath}>
            <PDFOutlineResolver>
               <Main />
            </PDFOutlineResolver>
         </PDFDocumentLoader>
      </Provider>
   );
}

function Main() {
   const { isSidebarOpen, isSideChatOpen } = usePDFReaderStore(
      useShallow((state) => ({
         isSidebarOpen: state.isSidebarOpen,
         isSideChatOpen: state.isSideChatOpen,
      })),
   );
   return (
      <div className="flex w-full h-full">
         <TogglePanel
            isOpen={isSidebarOpen}
            width="300px"
            height="100%"
            transitionDuration={300}
            className="border-r border-accent shrink-0"
         >
            <PDFOutlineSidebar />
         </TogglePanel>
         <div className="flex flex-col w-full h-full">
            <div className="w-full">
               <PDFToolbar />
            </div>
            <PDFViewer />
         </div>
         <TogglePanel
            isOpen={isSideChatOpen}
            width="500px"
            height="100%"
            transitionDuration={300}
            className="border-l border-accent shrink-0"
         >
            <SideChat />
         </TogglePanel>
      </div>
   );
}

type ProviderProps = {
   children: React.ReactNode;
   documentPath: string;
};
function Provider(props: ProviderProps) {
   return (
      <PDFReaderProvider>
         <PDFProvider>{props.children}</PDFProvider>
      </PDFReaderProvider>
   );
}

type PDFDocumentLoaderProps = {
   documentPath: string;
   children: React.ReactNode;
};
function PDFDocumentLoader(props: PDFDocumentLoaderProps) {
   const { documentProxy, isLoading, isError } = usePDFDocument(
      props.documentPath,
   );
   const { updateState } = usePDFStoreActions();

   useEffect(() => {
      async function updateMetadata() {
         if (!documentProxy) return;
         const pageRef = await documentProxy.getPage(1);
         const baseViewport = pageRef.getViewport({ scale: 1 });
         updateState({
            documentProxy: documentProxy,
            numPages: documentProxy.numPages,
            currentPage: 1,
            basePDFPageSize: {
               width: baseViewport.width,
               height: baseViewport.height,
            },
         });
      }
      updateMetadata();
   }, [documentProxy]);

   if (isLoading) {
      return <div></div>;
   }

   if (isError) {
      return (
         <div className="flex h-full w-full items-center justify-center flex-col gap-3">
            <p>Something went wrong</p>
            <Link
               to="/"
               className="py-2 px-5 rounded bg-gray-100 text-gray-800 hover:bg-gray-300"
            >
               Go back to home
            </Link>
         </div>
      );
   }
   return props.children;
}

type PDFOutlineResolverProps = {
   children: React.ReactNode;
};
function PDFOutlineResolver(props: PDFOutlineResolverProps) {
   const { documentProxy, outlines } = usePDFStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
         outlines: state.outlines,
      })),
   );
   const { setOutlines } = usePDFStoreActions();

   useEffect(() => {
      if (!documentProxy) return;
      const loadOutlines = async () => {
         const documentOutlines = await documentProxy.getOutline();
         await resolvePageNumberOutlines(documentOutlines, documentProxy);
         await resolveEndPageNumberOutlines(
            documentOutlines,
            documentProxy,
            documentProxy.numPages,
         );
         setOutlines(documentOutlines);
      };
      loadOutlines();
   }, [documentProxy]);

   if (!outlines) return <div></div>;
   return <div className="w-full h-full">{props.children}</div>;
}

// Resolve the destination of outlines to get the page number of the outline
const resolvePageNumberOutlines = async (
   outlines: PDFOutline[],
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
   outlines: PDFOutline[],
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
