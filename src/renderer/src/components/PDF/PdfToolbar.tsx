import { Sidebar } from "lucide-react";
import { IconButton } from "../MyButton/IconButton";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "../shadcn/select";

export function PdfToolbar() {
   return (
      <div className="group fixed top-0 left-0 right-0 z-50">
         <div className="flex justify-between items-center bg-[#21242A] border-b border-gray-600 px-6 py-1  group-hover:opacity-100 transition-all">
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
      </div>
   );
}

const SizeSelector = () => {
   const items = [
      {
         value: "fit-width",
         label: "Fit to width",
      },
      {
         value: "fit-height",
         label: "Fit to height",
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
   return (
      <div>
         <Select>
            <SelectTrigger className="cursor-pointer focus-visible:outline-none  focus-visible:ring-0 focus-visible:border-gray-600 border border-gray-600">
               <SelectValue placeholder="20%" />
            </SelectTrigger>
            <SelectContent align="center">
               {items.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="cursor-pointer">
                     {item.label}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
      </div>
   )
}