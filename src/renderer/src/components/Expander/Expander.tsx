import { cn } from "@/utils/tailwindUtils";
import { createContext, useContext } from "react";

export type ExpanderProps = {
   children: React.ReactNode;
   open: boolean;
   onToggle?: () => void;
};

type ExpanderContextType = {
   open: boolean;
   onToggle?: () => void;
};
const ExpanderContext = createContext<ExpanderContextType>({
   open: false,
   onToggle: () => {},
});
export function Expander({ children, open, onToggle }: ExpanderProps) {
   return (
      <ExpanderContext.Provider value={{ open, onToggle }}>
         <div className="flex flex-col">{children}</div>
      </ExpanderContext.Provider>
   );
}

export type ExpanderTriggerProps = {
   children?: React.ReactNode;
   className?: string;
};
export const ExpanderTrigger = ({
   children,
   className,
}: ExpanderTriggerProps) => {
   const { onToggle } = useContext(ExpanderContext);
   return (
      <div className={cn("", className)} onClick={onToggle}>
         {children}
      </div>
   );
};

export type ExpanderContentProps = {
   children: React.ReactNode;
   className?: string;
};
export const ExpanderContent = ({
   children,
   className,
}: ExpanderContentProps) => {
   const { open } = useContext(ExpanderContext);
   return (
      <div className={cn("w-full h-full", className, open ? "" : "hidden")}>
         {children}
      </div>
   );
};
