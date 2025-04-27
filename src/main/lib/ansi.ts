export const red = (message: string) => {
   return `\x1b[31m${message}\x1b[0m`;
 };

export const bold = (message: string) => {
   return `\x1b[1m${message}\x1b[0m`;
};

export const redBg = (message: string) => {
   return `\x1b[41m${message}\x1b[0m`;
};