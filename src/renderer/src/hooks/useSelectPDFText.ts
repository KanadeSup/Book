import { useCallback, useEffect, useState } from "react";

export function useSelectPDFText(ref: React.RefObject<HTMLDivElement | null>) {
   const [selectedText, setSelectedText] = useState("");
   const handleMouseUp = useCallback((event: MouseEvent) => {
      const selection = window.getSelection();
      if (!ref.current) return;
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
         setSelectedText("");
         return;
      }
      const range = selection.getRangeAt(0);
      const isInElement = ref.current.contains(range.commonAncestorContainer);
      if (!isInElement) {
         setSelectedText("");
         return;
      }
      const text = range.toString();
      setSelectedText(text);
      console.log(text);
   }, []);
   useEffect(() => {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
   }, []);

   return { selectedText, setSelectedText };
}
