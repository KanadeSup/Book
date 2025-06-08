import { clamp } from "@/lib/utils";
import { cn } from "@/utils/tailwindUtils";
import { useState, useEffect, useRef } from "react";
type HorizontalResizablePanelProps = {
   children: React.ReactNode;
   initialWidth?: number;
   minWidth?: number;
   maxWidth?: number;
   handlerPosition?: "left" | "right";
   isCollapsed?: boolean;
};

export function HorizontalResizablePanel(props: HorizontalResizablePanelProps) {
   // Initial default values if not provided
   const {
      isCollapsed,
      handlerPosition = "right",
      initialWidth = 300,
      minWidth = 200,
      maxWidth = 500,
   } = props;

   const [width, setWidth] = useState(initialWidth);
   const [isResizing, setIsResizing] = useState(false);

   const panelRef = useRef<HTMLDivElement>(null);
   const sheetRef = useRef<CSSStyleSheet | null>(null);
   const animationIdRef = useRef<number | null>(null);

   const startResizing = () => {
      setIsResizing(true);

      if (!sheetRef.current) {
         const sheet = new CSSStyleSheet();
         sheet.insertRule("* { cursor: ew-resize !important; }");
         (document.adoptedStyleSheets as CSSStyleSheet[]).push(sheet);
         sheetRef.current = sheet;
      }
   };

   const stopResizing = () => {
      setIsResizing(false);
      if (sheetRef.current) {
         document.adoptedStyleSheets = (
            document.adoptedStyleSheets as CSSStyleSheet[]
         ).filter((s) => s !== sheetRef.current);
      }
   };

   const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      startResizing();
   };

   // Handle resizing of the panel
   useEffect(() => {
      if (!isResizing) return;

      const handleMouseMove = (event: MouseEvent) => {
         if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
         }

         animationIdRef.current = requestAnimationFrame(() => {
            if (!panelRef.current) return;

            const panelRect = panelRef.current.getBoundingClientRect();
            const delta =
               handlerPosition === "left"
                  ? panelRect.left - event.clientX
                  : event.clientX - panelRect.right;

            setWidth((prev) => clamp(prev + delta, minWidth, maxWidth));
         });
      };

      const handleMouseUp = () => stopResizing();

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
         document.removeEventListener("mousemove", handleMouseMove);
         document.removeEventListener("mouseup", handleMouseUp);
      };
   }, [isResizing, handlerPosition, minWidth, maxWidth]);

   // Handle toggle collapse of the panel
   useEffect(() => {
      const panel = panelRef.current;
      if (!panel) return;

      // Smoothly change the width of the panel with a transition
      const transitionStyle = "width 0.2s ease-in-out";
      panel.style.transition = transitionStyle;
      panel.style.width = isCollapsed ? "0px" : `${width}px`;

      // Remove the transition after 300ms which equals the duration of the transition
      // This is to prevent unexpected behavior when resizing panel with the transition
      const resetTransition = () => {
         panel.style.transition = "none";
      };
      setTimeout(resetTransition, 200);
   }, [isCollapsed]);

   return (
      <div
         className={cn("h-full overflow-hidden shrink-0")}
         style={{ width: `${width}px` }}
         ref={panelRef}
      >
         <div
            className="flex h-full overflow-hidden relative"
            style={{ width: `${width}px` }}
         >
            {handlerPosition === "left" && (
               <ResizableHandler
                  position={handlerPosition}
                  onMouseDown={handleMouseDown}
               />
            )}

            <div className="h-full w-full shrink overflow-hidden">
               {props.children}
            </div>

            {handlerPosition === "right" && (
               <ResizableHandler
                  position={handlerPosition}
                  onMouseDown={handleMouseDown}
               />
            )}
         </div>
      </div>
   );
}

type ResizableHandlerProps = {
   position: "left" | "right";
   onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
};
const ResizableHandler = (props: ResizableHandlerProps) => {
   const isHandlerOnLeftSide = props.position === "left";
   const positionClass = isHandlerOnLeftSide ? "left-[2px]" : "right-[2px]";
   const indicatorClass = isHandlerOnLeftSide ? "mr-auto" : "ml-auto";

   return (
      <div
         className={cn(
            "w-[6px] h-full shrink-0 cursor-ew-resize absolute",
            positionClass,
         )}
         onMouseDown={props.onMouseDown}
      >
         <div className={cn("w-[1px] h-full bg-stone-600", indicatorClass)} />
      </div>
   );
};
