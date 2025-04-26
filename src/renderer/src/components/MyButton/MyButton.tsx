import { cn } from "@/utils/tailwindUtils";
import { JSX } from "react";
import { Button } from "../shadcn/button";
export type MyButtonProps = React.ComponentProps<"button"> & {
   variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
};
export function MyButton(props: MyButtonProps): JSX.Element {
   return (
      <Button {...props} className={cn("cursor-pointer", props.className)}>
         {props.children}
      </Button>
   );
}