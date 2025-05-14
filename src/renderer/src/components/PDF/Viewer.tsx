import "pdfjs-dist/web/pdf_viewer.css";
import { FixedSizeList } from "react-window";
import { PdfPage } from "./PdfPage";
import AutoSizer from "react-virtualized-auto-sizer";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePdfStore } from "@/stores/pdfStore";
import { useShallow } from "zustand/react/shallow";

export type ViewerProps = {};

type Dimension = {
   width: number;
   height: number;
};
export function Viewer() {
   const viewContainerRef = useRef<HTMLDivElement>(null);
   const [viewDimension, setViewDimension] = useState<Dimension>();
   const { documentProxy, numPages, originalDimension } = usePdfStore(
      useShallow((state) => ({
         documentProxy: state.documentProxy,
         numPages: state.state.numPages,
         originalDimension: state.state.originalDimension,
      })),
   );

   const scale = useMemo(() => {
      if (!originalDimension || !viewDimension) return 1;
      return viewDimension.height / originalDimension.height;
   }, [originalDimension, viewDimension]);

   useEffect(() => {
      const viewContainer = viewContainerRef.current;
      if (!viewContainer || !documentProxy || !originalDimension) return;
      setViewDimension({
         width: viewContainer.offsetWidth,
         height: viewContainer.offsetHeight,
      });
   }, [documentProxy, originalDimension, viewContainerRef.current]);

   const PageRow = ({ index, style }) => {
      return (
         <div style={style} className="flex justify-center">
            <PdfPage pageNumber={index + 1} scale={scale} />
         </div>
      );
   };

   return (
      <div className="w-full h-screen" ref={viewContainerRef}>
         <AutoSizer>
            {({ height, width }) => {
               // If Everything is not set which means the setup is not finished, return empty div
               if (!documentProxy || !originalDimension || !viewDimension) {
                  return <div></div>;
               }
               return (
                  <FixedSizeList
                     height={height}
                     width={width}
                     itemCount={numPages}
                     itemSize={viewDimension.height}
                  >
                     {PageRow}
                  </FixedSizeList>
               );
            }}
         </AutoSizer>
      </div>
   );
}
