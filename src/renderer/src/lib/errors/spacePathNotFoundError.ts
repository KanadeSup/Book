import { BaseError } from "./baseError";

export class SpacePathNotFoundError extends BaseError {
   constructor(message: string) {
      super("space-path-not-found", message);
   }
}
