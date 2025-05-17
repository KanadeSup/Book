import { createCommand } from "./base";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
   apiKey: "AIzaSyC_mmkamfuOj5BUOI3xZXovGbpQMnzxI-s",
});
createCommand("command:translateText", async (_, text: string) => {
   const prompt = `
      You are a professional translator.
      You are given a english word, you need to explain it in a simple way in english.
      And also give 3 examples of usage of the word. However the example should be in english and
      should not so simple.
      Addionally you also give me a Vietnamese translation of the word.
      Please give me the about with following json format:
      {
          word: <word>,
          definition: <english definition>,
          examples: [<example1>, <example2>, <example3>],
          vnTranslations: [<vnTranslation1>, <vnTranslation2>, <vnTranslation3>]
      }
      The word is: ${text}
   `;
   const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
   });
   const reponseText = response.text;
   if (!reponseText) {
      return {
         success: false,
         errorMessage: "Failed to translate text",
         data: null,
      };
   }
   return {
      success: true,
      data: JSON.parse(reponseText.replace("```json", "").replace("```", "")),
   };
});
