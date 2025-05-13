export type Book = {
   id: number;
   fileName: string;
   filePath: string;
   metaData: BookPdfMetaData
};

export type BookPdfMetaData = {
   title?: string,
   cover?: string,
}
