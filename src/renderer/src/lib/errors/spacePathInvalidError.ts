import { BaseError } from "./baseError";

export class SpacePathInvalidError extends BaseError {
   constructor(message: string) {
      super("space-path-invalid", message);
   }
}
