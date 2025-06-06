import React, { useState, useRef } from "react";
import { AtSign, Send } from "lucide-react";
import { MyButton } from "../MyButton/MyButton";
import { IconButton } from "../MyButton/IconButton";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "../shadcn/select";

type MessageInputProps = {
   onSendMessage?: (message: string) => void;
   isLoading?: boolean;
};

const AI_MODELS = [
   { id: "gpt-4o-mini", name: "OpenAI 4o mini" },
   { id: "gpt-4o", name: "OpenAI 4o" },
   { id: "gpt-3.5-turbo", name: "OpenAI 3.5 turbo" },
];

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
   const [message, setMessage] = useState("");
   const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
   const textareaRef = useRef<HTMLTextAreaElement>(null);

   const handleSend = () => {
      if (message.trim() && !isLoading) {
         onSendMessage?.(message.trim());
         setMessage("");
         if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
         }
      }
   };

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && e.shiftKey) {
         e.preventDefault();
         handleSend();
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
   };

   return (
      <div className="bg-gradient-to-tl from-[#A9A2BD] to-[#AC595F] p-[1px] rounded-md overflow-hidden">
         <div className="flex flex-col gap-2 p-2 bg-sidebar rounded-md">
            <textarea
               ref={textareaRef}
               spellCheck={false}
               value={message}
               onChange={handleInputChange}
               onKeyUp={handleKeyPress}
               placeholder="Enter a message..."
               className="w-full p-2 rounded-md border-none outline-none bg-transparent text-white placeholder-gray-400 resize-none dark-lean-scrollbar min-h-[40px] max-h-[120px] h-auto"
               disabled={isLoading}
            />
            <div className="flex items-center justify-between gap-1">
               <MyButton variant="ghost" size="sm">
                  <AtSign className="w-4 h-4" />
                  <span className="text-sm">Context</span>
               </MyButton>

               <div className="flex items-center gap-1">
                  <Select
                     value={selectedModel}
                     onValueChange={setSelectedModel}
                  >
                     <SelectTrigger className="cursor-pointer" size="sm">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        {AI_MODELS.map((model) => (
                           <SelectItem
                              key={model.id}
                              value={model.id}
                              className="cursor-pointer"
                           >
                              {model.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>

                  <IconButton
                     className="w-7 h-7"
                     onClick={handleSend}
                     disabled={!message.trim() || isLoading}
                  >
                     <Send className="w-4 h-4" />
                  </IconButton>
               </div>
            </div>
         </div>
      </div>
   );
}
