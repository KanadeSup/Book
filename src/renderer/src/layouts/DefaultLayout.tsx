import { DefaultSidebar } from "@/components/Sidebar/DefaultSidebar";
import { JSX } from "react";

type DefaultLayoutProps = {
   children: React.ReactNode;
}
export function DefaultLayout({ children }: DefaultLayoutProps): JSX.Element {
   return (
      <div className="p-2 flex-container">
         <DefaultSidebar />
         {children}
      </div>
   );
}