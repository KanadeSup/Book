import { CommandResponse } from "@/types/reponse.types";

export type TranslateDefinition = {
   word: string;
   definition: string;
   examples: string[];
   vnTranslations: string[];
};
export const translateText = async (text: string) => {
   const result = await window.electron.ipcRenderer.invoke(
      "command:translateText",
      text,
   );
   return result as CommandResponse<TranslateDefinition>;
};

export const generateText = async (prompt: string) => {
   const result = await window.electron.ipcRenderer.invoke(
      "command:generateText",
      prompt,
   );
   return result as CommandResponse<string>;
};

export const generateSummaryPrompt = (
   bookName: string,
   chapterName: string,
   content: string,
) => {
   return `
      You are a professional summarizer.
      You are given a content which is extracted from PDF file. So that there is some noise in the content.
      Make sure that you have to ignore the noise and focus on the actual content.
      This content is from a chapter of a book.
      Please summarize the chapter in a simple way without losing any important information.
      The summary doesn't need to be concise or short, but it should be clearly explain what the chapter is about.
      If possible, please format the summary in markdown format.
      The information bellow is the information of the book and the chapter and its content.
      Chapter name: ${chapterName}
      Content: ${content}
   `;
};
