import { IconButton } from "@/components/MyButton/IconButton";
import { DefaultSidebar } from "@/components/Sidebar/DefaultSidebar";
import { cn } from "@/utils/tailwindUtils";
import { Sidebar } from "lucide-react";
import { JSX, useContext, useReducer } from "react";
import { createContext } from "react";

type DefaultLayoutProps = {
   children: React.ReactNode;
};

export type DefaultLayoutState = {
   isSidebarOpen: boolean;
};
export type DefaultLayoutAction = {
   type: "SET_SIDEBAR_OPEN_STATE";
   payload: boolean;
};

const DefaultLayoutContext = createContext<
   | {
        state: DefaultLayoutState;
        dispatch: React.Dispatch<DefaultLayoutAction>;
     }
   | undefined
>(undefined);

function reducer(
   state: DefaultLayoutState,
   action: DefaultLayoutAction,
): DefaultLayoutState {
   switch (action.type) {
      case "SET_SIDEBAR_OPEN_STATE":
         return { ...state, isSidebarOpen: action.payload };
      default:
         return state;
   }
}
export function DefaultLayout({ children }: DefaultLayoutProps): JSX.Element {
   const [state, dispatch] = useReducer(reducer, {
      isSidebarOpen: true,
   });
   return (
      <DefaultLayoutContext.Provider value={{ state, dispatch }}>
         <div className="flex">
            <div
               className={cn(
                  "shrink-0",
                  state.isSidebarOpen == true ? "" : "hidden",
               )}
            >
               <DefaultSidebar />
            </div>
            <div className="w-full">{children}</div>
         </div>
      </DefaultLayoutContext.Provider>
   );
}

type TitleProps = {
   children: React.ReactNode;
   className?: string;
};

export function Title(props: TitleProps) {
   const defaultLayoutContext = useContext(DefaultLayoutContext);
   if (!defaultLayoutContext)
      throw Error("Context is currently null or undefined");
   const { state, dispatch} = defaultLayoutContext;
   return (
      <div className={cn("flex items-center px-2 gap-2 h-11", props.className)}>
         <IconButton
            onClick={() => {
               dispatch({ type: "SET_SIDEBAR_OPEN_STATE", payload: !state.isSidebarOpen });
            }}
         >
            <Sidebar className="w-5 h-5" />
         </IconButton>
         {props.children}
      </div>
   );
}
