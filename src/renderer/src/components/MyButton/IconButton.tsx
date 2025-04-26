import { cn } from "@/utils/tailwindUtils";

type IconButtonProps = {
   children: React.ReactNode;
   className?: string;
   onClick: () => void;
};

export function IconButton(props: IconButtonProps) {
   return (
      <div
         onClick={props.onClick}
         className={cn(
            "cursor-pointer hover:bg-accent rounded-md w-8 h-8 center",
            props.className,
         )}
      >
         {props.children}
      </div>
   );
}
