import { PDFDocumentProxy } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { FixedSizeList } from "react-window";
import { PdfPage } from "./PdfPage";
import AutoSizer from "react-virtualized-auto-sizer";
import { useEffect, useRef, useState } from "react";

export type ViewerProps = {
   documentProxy?: PDFDocumentProxy;
};

type Dimension = {
   width: number;
   height: number;
};
export function Viewer(props: ViewerProps) {
   const viewContainerRef = useRef<HTMLDivElement>(null);
   const [viewDimension, setViewDimension] = useState<Dimension>();
   const [nPages, setNPages] = useState(0);
   const [scale, setScale] = useState<number>(1);
   const [isSetupFinished, setIsSetupFinished] = useState(false);
   useEffect(() => {
      const viewContainer = viewContainerRef.current;
      const documentProxy = props.documentProxy;
      if (!viewContainer || !documentProxy) return;
      const setup = async () => {
         setViewDimension({
            width: viewContainer.offsetWidth,
            height: viewContainer.offsetHeight,
         });
         const pageProxy = await documentProxy.getPage(1);
         const viewport = pageProxy.getViewport({ scale: 1 });
         setNPages(documentProxy.numPages);
         setScale(viewContainer.offsetHeight / viewport.height);
         setIsSetupFinished(true);
      };
      setup();
   }, [viewContainerRef.current, props.documentProxy]);
   const PageRow = ({ index, style }) => {
      return (
         <div style={style} className="flex justify-center">
            <PdfPage
               documentProxy={props.documentProxy}
               pageNumber={index + 1}
               scale={scale}
            />
         </div>
      );
   };
   return (
      <div className="w-full h-screen" ref={viewContainerRef}>
         {isSetupFinished ? (
            <AutoSizer>
               {({ height, width }) => {
                  return (
                     <FixedSizeList
                        height={height}
                        width={width}
                        itemCount={nPages}
                        itemSize={viewDimension?.height}
                     >
                        {PageRow}
                     </FixedSizeList>
                  );
               }}
            </AutoSizer>
         ) : (
            <div>loading</div>
         )}
      </div>
   );
}
