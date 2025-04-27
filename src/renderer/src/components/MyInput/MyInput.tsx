import { JSX } from "react";
import { Input } from "../shadcn/input";
import { cn } from "@/utils/tailwindUtils";
export function MyInput(props: React.ComponentProps<"input">): JSX.Element {
   return (
      <Input
         {...props}
         className={cn(
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent border-gray-700 focus-visible:border-gray-500",
            props.className
         )}
      />
   );
}