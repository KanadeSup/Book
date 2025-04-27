import { BaseError } from "./baseError";

export class UnexceptionError extends BaseError {
   constructor(message: string) {
      super("unexception", message);
   }
}
