type BaseMessage = {
   id: string;
   content: string;
   timestamp: Date;
};

export type UserMessage = BaseMessage & {
   type: "user";
};

export type AssistantMessage = BaseMessage & {
   type: "assistant";
   isError?: boolean;
   isLoading?: boolean;
   richContent?: RichContent[];
};

export type Message = UserMessage | AssistantMessage;

export type SpecialPromptType = "long-summary" | "mindmap" | "timeline";

export type RichContentType = "text" | "image" | "table" | "list";

export type RichContent = {
   type: RichContentType;
   data: string;
};



