export type BaseResponse<T> = {
   success: boolean;
   errorMessage: string | null;
   data: T | null;
};

export type CommandResponse<T> = BaseResponse<T>;
