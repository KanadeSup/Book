import { JSX, useState } from "react";
import {
   Dialog,
   DialogContent,
   DialogTitle,
   DialogTrigger,
} from "../shadcn/dialog";
import { ArrowLeftRight, Folder } from "lucide-react";
import { MyInput } from "../MyInput/MyInput";
import { IconButton } from "../MyButton/IconButton";
import { MyButton } from "../MyButton/MyButton";
import { openFileOrDirDialog } from "@/services/dialog";
export type FolderChooserModalProps = {
   children?: React.ReactNode;
   onSubmit?: () => void;
   open: boolean;
   defaultFilePath?: string | null;
};
export function FolderChooserModal(
   props: FolderChooserModalProps,
): JSX.Element {
   const [filePath, setFilePath] = useState(props.defaultFilePath ?? "");
   const handleChooseDir = async () => {
      const res = await openFileOrDirDialog("dir");
      if(res.canceled) return;
      setFilePath(res.filePaths[0]);
   }
   return (
      <Dialog open={props.open}>
         <DialogTrigger></DialogTrigger>
         <DialogContent className="text-gray-300" aria-describedby={undefined}>
            <DialogTitle className="hidden" />
            <div className="flex items-center gap-3">
               <ArrowLeftRight className="w-5 h-5" />
               <h1 className="font-bold text-lg"> Change the space </h1>
            </div>
            <p className="text-gray-400">
               Choose the folder which your books are located
            </p>
            <div className="flex items-center gap-2">
               <MyInput
                  readOnly
                  className="focus-visible:border-input"
                  value={filePath}
               />
               <IconButton
                  className="w-9 h-9 shrink-0 bg-accent/40 hover:bg-accent/80 rounded-sm"
                  onClick={handleChooseDir}>
                  <Folder className="w-4 h-4" />
               </IconButton>
            </div>
            <div className="flex items-center gap-2 justify-end mt-4">
               <MyButton variant="destructive" className="font-semibold">
                  Cancel
               </MyButton>
               <MyButton
                  variant="default"
                  className="font-semibold bg-gray-300 text-gray-800 hover:bg-gray-300/80">
                  Change
               </MyButton>
            </div>
         </DialogContent>
      </Dialog>
   );
}
