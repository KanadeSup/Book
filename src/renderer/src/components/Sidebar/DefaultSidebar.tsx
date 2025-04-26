import { cn } from "@/utils/tailwindUtils";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@radix-ui/react-popover";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeftRight, Book, ChevronDown, Settings } from "lucide-react";
import { JSX } from "react";
import { FolderChooserModal } from "../MyModal/FolderChooserModal";

export function DefaultSidebar(): JSX.Element {
   return (
      <div className="h-screen w-[300px] border-r-2 border-accent">
         <Header />
         <NavList />
      </div>
   );
}

function Header(): JSX.Element {
   const SettingItems = [
      {
         name: "Settings",
         icon: Settings,
         action: () => {},
      },
      {
         name: "Change storage location",
         icon: ArrowLeftRight,
         action: () => {},
      },
   ];
   return (
      <div>
         <Popover>
            <PopoverTrigger className="cursor-pointer font-bold text-lg w-full flex justify-between items-center hover:bg-accent py-2 px-3 rounded border-b border-zinc-600">
               Capcut
               <ChevronDown className="w-4 h-4 stroke-[3px]" />
            </PopoverTrigger>
            <PopoverContent className="w-full pop-over-content-trigger-width border rounded-md border-zinc-500 bg-gray-950">
               {SettingItems.map((item) => (
                  <div
                     key={item.name}
                     className="hover:bg-accent px-3 py-2 cursor-pointer flex items-center gap-2 font-semibold"
                  >
                     <item.icon className="w-4 h-4" />
                     {item.name}
                  </div>
               ))}
            </PopoverContent>
         </Popover>
         <FolderChooserModal open={true} />
      </div>
   );
}

const navItems = [
   {
      name: "Books",
      icon: Book,
      to: "/",
   },
];
function NavList(): JSX.Element {
   const location = useLocation();
   return (
      <div className="">
         {navItems.map((item) => (
            <Link
               to={item.to}
               key={item.name}
               className={cn(
                  "hover:bg-zinc-800 px-3 py-2 cursor-pointer flex items-center gap-2 font-semibold",
                  location.pathname == item.to ? "bg-zinc-800" : "",
               )}
            >
               <item.icon className="w-4 h-4" />
               {item.name}
            </Link>
         ))}
      </div>
   );
}
