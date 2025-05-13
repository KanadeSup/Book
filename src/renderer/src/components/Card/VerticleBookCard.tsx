import { BookImage } from "lucide-react";
import { AspectRatio } from "../shadcn/aspect-ratio";

export type VerticleBookCardProps = {
   title: string;
   cover?: string;
};

export function VerticleBookCard(props: VerticleBookCardProps) {
   return (
      <div className="cursor-pointer select-none hover:scale-105 transition-all">
         <AspectRatio
            ratio={13 / 16}
            className="flex flex-col border border-gray-500 h-full rounded-sm overflow-hidden center"
         >
            {props.cover ? (
               <img src={props.cover} className="w-full h-full object-cover" />
            ) : (
               <BookImage className="w-12 h-12 stroke-gray-500" />
            )}
         </AspectRatio>
         <p className="shrink-0 mt-auto text-center  line-clamp-2 font-semibold text-gray-300">
            {props.title}
         </p>
      </div>
   );
}
