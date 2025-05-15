import { Sidebar } from "lucide-react";
import { IconButton } from "../MyButton/IconButton";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
} from "../shadcn/select";
import { usePdfStore } from "@/stores/pdfStore";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/utils/tailwindUtils";

export type PdfToolbarProps = {
   className?: string;
};
export function PdfToolbar(props: PdfToolbarProps) {
   return (
      <div className={cn("flex justify-between items-center bg-sidebar border-b border-accent px-6 py-1", props.className)}>
         {/* Left section */}
         <div className="flex items-center gap-2">
            <IconButton className="w-8 h-8 hover:bg-black/30">
               <Sidebar className="w-4 h-4" />
            </IconButton>
         </div>
         {/* Center section */}
         <div className="flex items-center gap-2">
            <SizeSelector />
         </div>
         {/* Right section */}
         <div className="flex items-center gap-2"></div>
      </div>
   );
}

const SizeSelector = () => {
   const { currentScale, setPdfState } = usePdfStore(
      useShallow((state) => ({
         currentScale: state.state.currentScale,
         setPdfState: state.setPdfState,
      })),
   );

   const items = [
      {
         value: "fit-height",
         label: "Fit to height",
      },
      {
         value: "fit-width",
         label: "Fit to width",
      },
      {
         value: "10",
         label: "10%",
      },
      {
         value: "25",
         label: "25%",
      },
      {
         value: "50",
         label: "50%",
      },
      {
         value: "100",
         label: "100%",
      },
      {
         value: "150",
         label: "150%",
      },
      {
         value: "200",
         label: "200%",
      },
      {
         value: "300",
         label: "300%",
      },
      {
         value: "500",
         label: "500%",
      },
   ];
   const handleScaleChange = (value: string) => {
      if (value === "fit-width" || value === "fit-height") {
         setPdfState({
            currentScale: {
               scaleType: value,
            },
         });
      } else {
         setPdfState({
            currentScale: {
               scaleType: "percentage",
               scaleValue: parseInt(value),
            },
         });
      }
   };
   return (
      <div>
         <Select
            onValueChange={handleScaleChange}
            value={currentScale.scaleType !== "percentage" ? currentScale.scaleType : currentScale.scaleValue?.toString()}
         >
            <SelectTrigger className="cursor-pointer focus-visible:outline-none  focus-visible:ring-0 focus-visible:border-gray-600 border border-gray-600">
               {currentScale.scaleType === "percentage" && (
                  <p>{currentScale.scaleValue}%</p>
               )}
               {currentScale.scaleType === "fit-width" && <p>Fit to width</p>}
               {currentScale.scaleType === "fit-height" && <p>Fit to height</p>}
            </SelectTrigger>
            <SelectContent align="center" className="w-[150px]">
               {items.map((item) => (
                  <SelectItem
                     key={item.value}
                     value={item.value}
                     className="cursor-pointer"
                  >
                     {item.label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      </div>
   );
};
