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
         if (!element) return;

         const selection = window.getSelection();
         const range = selection?.getRangeAt(0);
         if (
            exceptElement &&
            range &&
            exceptElement.current &&
            exceptElement.current.contains(range?.commonAncestorContainer)
         ) {
            return;
         }
         // check if the mouse is in the except element
         if (
            exceptElement &&
            exceptElement.current &&
            exceptElement.current.contains(event.target as Node)
         ) {
            return;
         }

         if (!selection?.rangeCount || selection.isCollapsed || !range) {
            return clearSelection();
         }

         if (!element.contains(range.commonAncestorContainer)) {
            return clearSelection();
         }

         setSelectedText(range.toString());
         setMousePosition({ x: event.clientX, y: event.clientY });
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
