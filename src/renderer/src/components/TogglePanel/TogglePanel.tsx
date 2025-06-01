import { cn } from "@/utils/tailwindUtils";

export type TogglePanelProps = {
   isOpen?: boolean;
   children?: React.ReactNode;
   className?: string;
   width: string;
   height?: string;
   transitionDuration?: number;
};
export function TogglePanel(props: TogglePanelProps) {
   return (
      <div
         className={cn(
            "transition-all overflow-hidden",
            props.className,
         )}
         style={{
            width: props.isOpen ? props.width : 0,
            height: props.height,
            transitionDuration: `${props.transitionDuration}ms`,
         }}
      >
         <div
            className="h-full"
            style={{ width: props.width, height: props.height }}
         >
            {props.children}
         </div>
      </div>
   );
}
