export type CommandResponse<T> = {
   success: boolean;
   errorMessage: string | null;
   data: T | null;
};
