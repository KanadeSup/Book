import { ErrorCode } from "@/types/error.types";

export abstract class BaseError extends Error {
   errorCode: ErrorCode;
   constructor(errorCode: ErrorCode, message: string) {
      super(message);
      this.errorCode = errorCode;
   }
}
