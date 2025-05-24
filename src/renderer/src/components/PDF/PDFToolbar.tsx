import {
   Columns2,
   Eye,
   FileStack,
   RectangleVertical,
   Sidebar,
   TableRowsSplit,
} from "lucide-react";
import { IconButton } from "../MyButton/IconButton";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
} from "../shadcn/select";
import { useShallow } from "zustand/react/shallow";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { cn } from "@/utils/tailwindUtils";
import { useRef, useState, useEffect } from "react";
import { usePDFStore, usePDFStoreActions } from "./PDFProvider";
import { PDFPageLayout, PDFPageScaleType, PDFPageTransition } from "@/types/pdf.types";
import { usePDFReaderStoreActions } from "./PDFReaderProvider";
export type PdfToolbarProps = {
   className?: string;
};
export function PDFToolbar(props: PdfToolbarProps) {
   const { scrollToPage } = usePDFStoreActions();
   const { toggleSidebarVisibility } = usePDFReaderStoreActions();
   const handlePageNumberChange = (pageNumber: number) => {
      scrollToPage(pageNumber);
   };
   return (
      <div
         className={cn(
            "grid grid-cols-3 items-center w-full bg-sidebar border-b border-accent px-2 py-1",
            props.className,
         )}
      >
         {/* Left section */}
         <div className="flex items-center gap-1">
            <IconButton
               className="w-8 h-8 hover:bg-accent"
               onClick={() => toggleSidebarVisibility()}
            >
               <Sidebar className="w-4 h-4" />
            </IconButton>
            <div className="h-5 w-[1px] bg-gray-600" />
            <ViewControl />
            <CurrentPageNumber onSubmit={handlePageNumberChange} />
         </div>

         {/* Center section */}
         <div className="flex items-center gap-2 justify-self-center">
            <SizeSelector />
         </div>

         {/* Right section */}
         <div className="flex items-center gap-2 justify-self-end"></div>
      </div>
   );
}

type SpecificScaleItem = {
   value: Extract<PDFPageScaleType, "fit-height" | "fit-width">;
   label: string;
};
type PercentageScaleItem = {
   value: number;
   label: string;
};
type ScaleItem = SpecificScaleItem | PercentageScaleItem;
const SizeSelector = () => {
   const { currentScale } = usePDFStore(
      useShallow((state) => ({
         currentScale: state.currentScale,
      })),
   );
   const { changeCurrentScale } = usePDFStoreActions();

   const items: ScaleItem[] = [
      {
         value: "fit-height",
         label: "Fit to height",
      },
      {
         value: "fit-width",
         label: "Fit to width",
      },
      {
         value: 10,
         label: "10%",
      },
      {
         value: 25,
         label: "25%",
      },
      {
         value: 50,
         label: "50%",
      },
      {
         value: 100,
         label: "100%",
      },
      {
         value: 150,
         label: "150%",
      },
      {
         value: 200,
         label: "200%",
      },
      {
         value: 300,
         label: "300%",
      },
      {
         value: 500,
         label: "500%",
      },
   ];
   const handleScaleChange = (value: string) => {
      if (value === "fit-width" || value === "fit-height") {
         changeCurrentScale(value);
      } else {
         changeCurrentScale("percentage", parseInt(value));
      }
   };
   return (
      <div>
         <Select
            onValueChange={handleScaleChange}
            value={
               currentScale.scaleType !== "percentage"
                  ? currentScale.scaleType
                  : currentScale.scalePercentage.toString()
            }
         >
            <SelectTrigger className="cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-600 border border-gray-600 data-[size=default]:h-8">
               {currentScale.scaleType === "percentage" && (
                  <p>{currentScale.scalePercentage}%</p>
               )}
               {currentScale.scaleType === "fit-width" && <p>Fit to width</p>}
               {currentScale.scaleType === "fit-height" && (
                  <p>Fit to height</p>
               )}
            </SelectTrigger>
            <SelectContent align="center" className="w-[150px]">
               {items.map((item) => (
                  <SelectItem
                     key={item.value}
                     value={item.value.toString()}
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

type PageTransitionItem = {
   label: string;
   value: PDFPageTransition;
   icon: React.ElementType;
};
type PageLayoutItem = {
   label: string;
   value: PDFPageLayout;
   icon: React.ElementType;
};
function ViewControl() {
   const pageTransitionItem: PageTransitionItem[] = [
      {
         label: "Continuous page",
         value: "continuous-page",
         icon: TableRowsSplit,
      },
      {
         label: "Page by page",
         value: "page-by-page",
         icon: FileStack,
      },
   ];
   const pageLayoutItem: PageLayoutItem[] = [
      {
         label: "Single page",
         value: "single-page",
         icon: RectangleVertical,
      },
      {
         label: "Double page",
         value: "double-page",
         icon: Columns2,
      },
      {
         label: "Cover facing page",
         value: "cover-facing-page",
         icon: Columns2,
      },
   ];
   const pageTransition = usePDFStore((state) => state.pageTransition);
   const pageLayout = usePDFStore((state) => state.pageLayout);
   const { setPageTransition, setPageLayout } = usePDFStoreActions();
   return (
      <div>
         <Popover>
            <PopoverTrigger>
               <IconButton className="hover:bg-accent">
                  <Eye className="w-4 h-4" />
               </IconButton>
            </PopoverTrigger>
            <PopoverContent className="border-gray-600 border p-1 text-[13px]">
               <div>
                  <h1 className="text-gray-200 p-1"> Page transition </h1>
                  <div className="space-y-1">
                     {pageTransitionItem.map((item) => (
                        <div
                           key={item.value}
                           className={cn(
                              "px-2 py-1 hover:bg-accent cursor-pointer transition-all rounded-md flex items-center gap-1",
                              item.value === pageTransition ? "bg-accent" : "",
                           )}
                           onClick={() => {
                              setPageTransition(item.value);
                           }}
                        >
                           <item.icon className="w-5 h-5" />
                           {item.label}
                        </div>
                     ))}
                  </div>
               </div>
               <div className="w-full h-px bg-gray-600 my-1 mt-2" />
               <div className="space-y-1">
                  <h1 className="text-gray-200 p-1"> Page layout </h1>
                  <div className="space-y-1">
                     {pageLayoutItem.map((item) => (
                        <div
                           key={item.value}
                           className={cn(
                              "px-2 py-1 hover:bg-accent cursor-pointer transition-all rounded-md flex items-center gap-1",
                              item.value === pageLayout ? "bg-accent" : "",
                           )}
                           onClick={() => {
                              setPageLayout(item.value);
                           }}
                        >
                           <item.icon className="w-5 h-5" />
                           {item.label}
                        </div>
                     ))}
                  </div>
               </div>
            </PopoverContent>
         </Popover>
      </div>
   );
}

type CurrentPageNumberProps = {
   onSubmit?: (pageNumber: number) => void;
};
const CurrentPageNumber = (props: CurrentPageNumberProps) => {
   const currentPageNumber = usePDFStore((state) => state.currentPage);
   const numPages = usePDFStore((state) => state.numPages);
   const inputRef = useRef<HTMLInputElement>(null);
   const [pageNumberInput, setPageNumberInput] = useState(
      currentPageNumber.toString(),
   );
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
         setPageNumberInput("");
         return;
      }
      const inputPageNumber = parseInt(value);
      if (isNaN(inputPageNumber)) {
         setPageNumberInput(value);
         return;
      }
      let updatePageNumber = inputPageNumber;
      if (inputPageNumber > numPages) {
         updatePageNumber = numPages;
      }
      if (inputPageNumber < 1) {
         updatePageNumber = 1;
      }
      setPageNumberInput(updatePageNumber.toString());
   };
   const handleFocus = () => {
      setTimeout(() => {
         if (!inputRef.current) return;
         const value = inputRef.current.value;
         inputRef.current.setSelectionRange(value.length, value.length);
      }, 0);
   };
   useEffect(() => {
      setPageNumberInput(currentPageNumber.toString());
   }, [currentPageNumber]);
   return (
      <div className="flex items-center gap-1 text-sm" onFocus={handleFocus}>
         <input
            ref={inputRef}
            className="py-[2px] px-2 hover:bg-accent rounded w-12 text-right border border-gray-600"
            value={pageNumberInput}
            onChange={handleInputChange}
            onKeyDown={(e) => {
               if (e.key === "Enter") {
                  const updatePageNumber = parseInt(pageNumberInput);
                  if (isNaN(updatePageNumber)) {
                     return;
                  }
                  props.onSubmit?.(updatePageNumber);
                  return;
               }
               if (!isValidKey(e.key)) {
                  e.preventDefault();
               }
            }}
            onFocus={handleFocus}
            onBlur={() => setPageNumberInput(currentPageNumber.toString())}
         />
         <span className="text-gray-200">/</span>
         <div className="">{numPages}</div>
      </div>
   );
};

const isValidKey = (value: string) => {
   if (value >= "0" && value <= "9") {
      return true;
   }
   if (value === "Backspace" || value === "Delete") {
      return true;
   }
   if (value === "ArrowLeft" || value === "ArrowRight") {
      return true;
   }
   return false;
};
