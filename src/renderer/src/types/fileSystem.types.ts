export type Entry = {
   inode: number;
   type: "directory" | "file";
   name: string;
   absolutePath: string;
   parentPath: string;
};