import { FolderClock, Plus } from "lucide-react";
import { IconButton } from "../MyButton/IconButton";
import { MyInput } from "../MyInput/MyInput";

export function SideChat() {
   return (
      <div className="flex flex-col w-full h-full bg-sidebar">
         <ChatHeader />
         <div className="flex flex-col gap-2 p-2">
            <PrebuildPromptCard
               title="Summarize the document"
               description="Summarize the document"
               onClick={() => {}}
            />
         </div>
         <div className="mt-auto p-2">
            <MyInput
               placeholder="Enter a message"
               className="w-full p-2 rounded-md"
            />
         </div>
      </div>
   );
}

function ChatHeader() {
   return (
      <div className="flex items-center justify-between border-b border-accent h-[41px] px-2">
         <h1 className="font-bold">Chat</h1>
         <div className="flex items-center">
            <IconButton>
               <Plus className="w-4 h-4" />
            </IconButton>
            <IconButton>
               <FolderClock className="w-4 h-4" />
            </IconButton>
         </div>
      </div>
   );
}

type PrebuildPromptCardProps = {
   title: string;
   description: string;
   onClick: () => void;
};
function PrebuildPromptCard(props: PrebuildPromptCardProps) {
   return (
      <div className="flex items-center justify-between border border-zinc-700 rounded-md p-2 cursor-pointer hover:border-green-600 transition-all">
         <div>
            <h1 className="font-bold">{props.title}</h1>
            <p className="text-sm text-gray-400">{props.description}</p>
         </div>
      </div>
   );
}
