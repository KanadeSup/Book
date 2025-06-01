import { Link } from "@tanstack/react-router";
import PDFProvider, { usePDFStoreActions } from "./PDFProvider";
import { usePDFDocument } from "@/hooks/usePDFDocument";
import { useEffect } from "react";
import { PDFReaderProvider, usePDFReaderStore } from "./PDFReaderProvider";
import { PDFViewer } from "./PDFViewer";
import { PDFToolbar } from "./PDFToolbar";
import { PDFOutlineSidebar } from "./PDFOutlineSidebar";
import { useShallow } from "zustand/react/shallow";
import { SideChat } from "../Chat/SideChat";
import { TogglePanel } from "../TogglePanel/TogglePanel";
export type PDFReaderProps = {
   documentPath: string;
};
export default function PDFReader(props: PDFReaderProps) {
   return (
      <Provider documentPath={props.documentPath}>
         <PDFDocumentLoader documentPath={props.documentPath}>
            <Main />
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
