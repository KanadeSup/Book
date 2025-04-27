import { red, redBg } from "./ansi";

export class Logger {
   static error(...messages: any[]) {
      const message = messages.join(" ")
      console.error(`${redBg("[ERROR]")} ${red(message)}`)
   }
}