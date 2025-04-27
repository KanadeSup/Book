export type CommandResponse<T> =
   | SuccessCommandResponse<T>
   | FailCommandResponse<T>;

export type SuccessCommandResponse<T> = {
   success: true,
   data: T;
};

export type FailCommandResponse<T> = {
   success: false,
   errorMessage: string | null;
   errorCode?: string;
   data: T | null;
};
