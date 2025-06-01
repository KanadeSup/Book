import { useCallback, useEffect, useState } from "react";
export function useSelectPDFText(
   element?: HTMLDivElement,
   exceptElement?: React.RefObject<HTMLDivElement | null>,
) {
   const [selectedText, setSelectedText] = useState("");
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

   const clearSelection = () => {
      setSelectedText("");
      setMousePosition({ x: 0, y: 0 });
   };

   const handleMouseUp = useCallback(
      (event: MouseEvent) => {
         setTimeout(() => {
            if (!element) return;

            const selection = window.getSelection();
            // Early return if selection or click is within the except element
            if (exceptElement?.current) {
               if (
                  selection &&
                  selection.rangeCount &&
                  exceptElement.current.contains(
                     selection.getRangeAt(0).commonAncestorContainer,
                  )
               ) {
                  return;
               }
               if (exceptElement.current.contains(event.target as Node)) {
                  return;
               }
            }
            if (!selection?.rangeCount || selection.isCollapsed) {
               return clearSelection();
            }
            const range = selection.getRangeAt(0);

            if (!element.contains(range.commonAncestorContainer)) {
               return clearSelection();
            }

            setSelectedText(range.toString());
            setMousePosition({ x: event.clientX, y: event.clientY });
         }, 0);
      },
      [element],
   );

   useEffect(() => {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
   }, [handleMouseUp]);

   useEffect(() => {
      if (!selectedText) {
         clearSelection();
      }
   }, [selectedText]);

   return { selectedText, setSelectedText, mousePosition, setMousePosition };
}
