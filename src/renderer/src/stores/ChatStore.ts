import { generateText } from "@/services/ai";
import { AssistantMessage, Message } from "@/types/chat.types";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

export type ChatStore = {
   messages: Message[];
   isLoading: boolean;
   actions: {
      addMessage(message: Omit<Message, "id" | "timestamp">): string;
      updateMessage(id: string, updates: Partial<Message>): void;
      sendMessage(messageContent: string, prompt?: string): void;
      newChat(): void;
   };
};

export const createChatStore = (initialState: Omit<ChatStore, "actions">) => {
   return create<ChatStore>((set, get) => ({
      ...initialState,
      actions: {
         addMessage: (message) => {
            const id = uuidv4();
            set((state) => ({
               messages: [
                  ...state.messages,
                  { ...message, id, timestamp: new Date() },
               ],
            }));
            return id;
         },
         updateMessage: (id, updates) => {
            set((state) => ({
               messages: state.messages.map((message) =>
                  message.id === id ? { ...message, ...updates } : message,
               ),
            }));
         },
         sendMessage: async (messageContent, prompt) => {
            const { addMessage, updateMessage } = get().actions;
            // Add user message
            addMessage({
               type: "user",
               content: messageContent,
            });

            // Add loading message
            const loadingMessage: Omit<AssistantMessage, "id" | "timestamp"> = {
               type: "assistant",
               content: "",
               isLoading: true,
            };
            const assistantMessageId = addMessage(loadingMessage);

            set(() => ({
               isLoading: true,
            }));

            const response = await generateText(prompt || messageContent);
            if (response.success) {
               updateMessage(assistantMessageId, {
                  content: response.data,
                  isLoading: false,
               });
            } else {
               updateMessage(assistantMessageId, {
                  content: "Sorry, I encountered an error. Please try again.",
                  isLoading: false,
                  isError: true,
               });
            }

            set(() => ({
               isLoading: false,
            }));
         },
         newChat: () => {
            set(() => ({
               messages: [],
            }));
         },
      },
   }));
};
