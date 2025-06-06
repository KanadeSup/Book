import { Message } from "@/types/chat.types";
import { BotIcon } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "@/utils/tailwindUtils";

type MessageListProps = {
   messages: Message[];
   className?: string;
};
export function MessageList(props: MessageListProps) {
   return (
      <div className="flex flex-col gap-2 h-full">
         <div
            className={cn("flex flex-col gap-2 h-full", props.className)}
         >
            {props.messages.map((message) => (
               <MessageItem key={message.id} message={message} />
            ))}
         </div>
      </div>
   );
}

function MessageItem(props: { message: Message }) {
   if (props.message.type === "user") {
      return <UserMessage message={props.message} />;
   } else {
      return <AssistantMessage message={props.message} />;
   }
}

function UserMessage(props: { message: Message }) {
   return (
      <div className="border-b border-gray-700 pb-2 mb-3">
         <Markdown>{props.message.content}</Markdown>
      </div>
   );
}

function AssistantMessage(props: { message: Message }) {
   return (
      <div className="border-b border-gray-700 pb-2">
         <div className="flex items-start gap-2 mb-3">
            <div className="w-10 h-10 bg-accent flex items-center justify-center rounded-md">
               <BotIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
               <p className="text-sm text-gray-300 font-bold">OpenAI</p>
               <p className="text-xs text-gray-400">OpenAI o4 mini</p>
            </div>
         </div>
         <div className="prose prose-invert prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-base prose-a:underline">
            <Markdown>{props.message.content}</Markdown>
         </div>
      </div>
   );
}
