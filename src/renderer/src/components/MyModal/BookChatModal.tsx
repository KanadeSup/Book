import { Dialog, DialogContent, DialogTrigger } from "../shadcn/dialog";

export type BookChatModalProps = {
   open?: boolean;
   onClose?: () => void;
};
export function BookChatModal(props: BookChatModalProps) {
   const prebuildPrompts = [
      {
         title: "Prebuild Prompt 1",
         description: "Prebuild Prompt 1 Description",
         onClick: () => {},
      },
   ];
   return (
      <Dialog
         open={props.open}
         onOpenChange={(status) =>
            !status && props.onClose?.()
         }
      >
         <DialogTrigger className="hidden"></DialogTrigger>
         <DialogContent className="min-w-[80%] h-[80%] border border-gray-400">
            <div className="flex gap-4 items-start">
               {prebuildPrompts.map((prompt) => (
                  <PrebuildPromptCard
                     key={prompt.title}
                     {...prompt}
                  />
               ))}
            </div>
         </DialogContent>
      </Dialog>
   );
}

type PrebuildPromptCardProps = {
   title: string;
   description: string;
   onClick: () => void;
};
const PrebuildPromptCard = (props: PrebuildPromptCardProps) => {
   return (
      <div className="border border-gray-400 p-2 rounded-md cursor-pointer select-none" onClick={props.onClick}>
         <div className="font-bold text-sm">{props.title}</div>
         <div className="text-sm text-gray-400">{props.description}</div>
      </div>
   );
};
