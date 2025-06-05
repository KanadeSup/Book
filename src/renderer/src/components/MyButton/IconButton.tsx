import { cn } from "@/utils/tailwindUtils";

type IconButtonProps = {
   children: React.ReactNode;
   className?: string;
   onClick?: () => void;
   disabled?: boolean;
};

export function IconButton(props: IconButtonProps) {
   return (
      <div
         onClick={() => props.disabled ? null : props.onClick?.()}
         className={cn(
            "cursor-pointer hover:bg-accent rounded-md w-8 h-8 center",
            props.disabled ? "opacity-80" : "",
            props.className,
         )}
      >
         {props.children}
      </div>
   );
}
