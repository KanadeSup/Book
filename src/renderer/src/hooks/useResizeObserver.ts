import { useEffect, useRef, useState } from "react";

export type ResizeObserverOptions = {
   disableWidth?: boolean;
   disableHeight?: boolean;
};
const useResizeObserver = (
   element?: HTMLDivElement | null,
   options?: ResizeObserverOptions,
) => {
   const [size, setSize] = useState({ width: 0, height: 0 });
   const prevSize = useRef({ width: 0, height: 0 });
   useEffect(() => {
      if (!element) return;

      const resizeObserver = new ResizeObserver((entries) => {
         const entry = entries[0];
         if (!entry) return;

         const { width, height } = entry.contentRect;
         const { width: prevWidth, height: prevHeight } = prevSize.current;
         if (width === prevWidth && height === prevHeight) return;
         if (options?.disableWidth) {
            if (height !== prevHeight) {
               setSize({ width: 0, height });
            }
            return;
         }

         if (options?.disableHeight) {
            if (width !== prevWidth) {
               setSize({ width, height: 0 });
            }
            return;
         }
         setSize({ width, height });
      });

      resizeObserver.observe(element);

      return () => {
         resizeObserver.disconnect();
      };
   }, [element]);
   return size;
};

export { useResizeObserver };
