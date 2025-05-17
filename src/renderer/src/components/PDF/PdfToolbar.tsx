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
import {
   PageLayoutView,
   PageTransitionView,
   usePdfStore,
} from "@/stores/pdfStore";
import { useShallow } from "zustand/react/shallow";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { cn } from "@/utils/tailwindUtils";
import { useRef, useContext, useState, useEffect } from "react";
import { BookViewerLayoutContext } from "@/routes/books/$bookId";
export type PdfToolbarProps = {
   className?: string;
};
export function PdfToolbar(props: PdfToolbarProps) {
   const { setSideBarVisible, sideBarVisible } = useContext(
      BookViewerLayoutContext,
   );
   const { navigateToPage } = usePdfStore(
      useShallow((state) => ({
         navigateToPage: state.navigateToPage,
      })),
   );
   const handlePageNumberChange = (pageNumber: number) => {
      navigateToPage(pageNumber - 1);
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
               onClick={() => setSideBarVisible(!sideBarVisible)}
            >
               <Sidebar className="w-4 h-4" />
            </IconButton>
            <div className="h-5 w-[1px] bg-gray-600" />
            <ViewControl />
            <CurrentPageNumber onChange={handlePageNumberChange} />
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
            value={
               currentScale.scaleType !== "percentage"
                  ? currentScale.scaleType
                  : currentScale.scaleValue?.toString()
            }
         >
            <SelectTrigger className="cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-600 border border-gray-600 data-[size=default]:h-8">
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

type PageTransitionItem = {
   label: string;
   value: PageTransitionView;
   icon: React.ElementType;
};
type PageLayoutItem = {
   label: string;
   value: PageLayoutView;
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
   const viewControl = usePdfStore((state) => state.state.viewControl);
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
                              item.value === viewControl.pageTransition
                                 ? "bg-accent"
                                 : "",
                           )}
                           onClick={() => {
                              usePdfStore.setState((state) => ({
                                 ...state,
                                 state: {
                                    ...state.state,
                                    viewControl: {
                                       ...state.state.viewControl,
                                       pageTransition: item.value,
                                    },
                                 },
                              }));
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
                              item.value === viewControl.pageLayout
                                 ? "bg-accent"
                                 : "",
                           )}
                           onClick={() => {
                              usePdfStore.setState((state) => ({
                                 ...state,
                                 state: {
                                    ...state.state,
                                    viewControl: {
                                       ...state.state.viewControl,
                                       pageLayout: item.value,
                                    },
                                 },
                              }));
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
   onChange?: (pageNumber: number) => void;
};
const CurrentPageNumber = (props: CurrentPageNumberProps) => {
   const currentPageNumber = usePdfStore((state) => state.state.currentPage);
   const numPages = usePdfStore((state) => state.state.numPages);
   const inputRef = useRef<HTMLInputElement>(null);
   const [pageNumber, setPageNumber] = useState(currentPageNumber);
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
         return;
      }
      if (isNaN(parseInt(value))) {
         return;
      }
      const pageNumber = parseInt(value);
      let updatePageNumber = pageNumber;
      if (pageNumber > numPages) {
         updatePageNumber = numPages;
      }
      if (pageNumber < 1) {
         updatePageNumber = 1;
      }
      setPageNumber(updatePageNumber);
   };
   const handleFocus = () => {
      setTimeout(() => {
         if (!inputRef.current) return;
         const value = inputRef.current.value;
         inputRef.current.setSelectionRange(value.length, value.length);
      }, 0);
   };
   const handleBlur = () => {
      props.onChange?.(pageNumber);
   };
   useEffect(() => {
      setPageNumber(currentPageNumber);
   }, [currentPageNumber]);
   return (
      <div className="flex items-center gap-1 text-sm" onFocus={handleFocus}>
         <input
            ref={inputRef}
            className="py-[2px] px-2 hover:bg-accent rounded w-12 text-right border border-gray-600"
            value={pageNumber}
            onChange={handleInputChange}
            onKeyDown={(e) => {
               if (e.key === "Enter") {
                  e.preventDefault();
                  handleBlur();
               }
            }}
            onBlur={handleBlur}
            onFocus={handleFocus}
         />
         <span className="text-gray-200">/</span>
         <div className="">{numPages}</div>
      </div>
   );
};
