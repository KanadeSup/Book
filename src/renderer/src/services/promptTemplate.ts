import { SpecialPromptType } from "@/types/chat.types";
import { CalendarIcon, LucideIcon, MapIcon, Notebook } from "lucide-react";

export type GeneratePromptContext = {
   bookName: string;
   chapterName: string;
   content: string;
};

export type GenerateMessageContext = {
   title: string;
};

export type PromptTemplate = {
   type: SpecialPromptType;
   title: string;
   description: string;
   icon: LucideIcon;
   generatePrompt: (context: GeneratePromptContext) => string;
   generateMessage: (context: GenerateMessageContext) => string;
};

export function getTemplateByType(type: SpecialPromptType): PromptTemplate {
   const template = promptTemplates.find((template) => template.type === type);
   if (!template) {
      throw Error(
         "Cannot find template, maybe template is not implement or passed type is incorrect",
      );
   }
   return template;
}

export const promptTemplates: PromptTemplate[] = [
   {
      type: "long-summary",
      title: "Long Summary",
      description: "Generate a comprehensive summary",
      icon: Notebook,
      generatePrompt: (context: GeneratePromptContext) => {
         return `
            You are a professional summarizer.
            You are given a content which is extracted from PDF file. So that there is some noise in the content.
            Make sure that you have to ignore the noise and focus on the actual content.
            This content is from a chapter of a book.
            Please summarize the chapter in a simple way without losing any important information.
            The summary doesn't need to be concise or short, but it should be clearly explain what the chapter is about.
            If possible, please format the summary in markdown format.
            The information bellow is the information of the book and the chapter and its content.
            Book name: ${context.bookName}
            Chapter name: ${context.chapterName}
            Content: ${context.content}
         `;
      },
      generateMessage: (context: GenerateMessageContext) => {
         return `Summarize **${context.title}**`;
      },
   },

   {
      type: "mindmap",
      title: "Mind Map",
      description: "Create a structured mind map",
      icon: MapIcon,
      generatePrompt: (context: GeneratePromptContext) => {
         return `
            Create a detailed mind map for "${context.chapterName}" based on the following content:
            ${context.content}
         `;
      },

      generateMessage: (context: GenerateMessageContext) => {
         return `Create mind map for **${context.title}**`;
      },
   },

   {
      type: "timeline",
      title: "Timeline",
      description: "Generate a chronological timeline",
      icon: CalendarIcon,
      generatePrompt: (context: GeneratePromptContext) => {
         return `
            Create a chronological timeline for "${context.chapterName}" based on the following content:
            ${context.content}
         `;
      },
      generateMessage: (context: GenerateMessageContext) => {
         return `Create timeline for **${context.title}**`;
      },
   },
];
