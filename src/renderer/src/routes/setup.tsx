import { IconButton } from "@/components/MyButton/IconButton";
import { MyButton } from "@/components/MyButton/MyButton";
import { MyInput } from "@/components/MyInput/MyInput";
import { openFileOrDirDialog } from "@/services/dialog";
import { useConfigStore } from "@/stores/configStore";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Folder, OctagonX } from "lucide-react";
import { JSX, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/setup")({
   component: SetupPage,
});

function SetupPage(): JSX.Element {
   const [filePath, setFilePath] = useState("");
   const navigate = useNavigate();
   const { config, setConfig } = useConfigStore();
   const handleChooseDir = async () => {
      const res = await openFileOrDirDialog("dir");
      if (res.success) {
         const dialogResult = res.data;
         if (dialogResult.canceled) return;
         const choosedDirPath = dialogResult.filePaths[0];
         setFilePath(choosedDirPath);
         setFilePath(choosedDirPath);
         return;
      }
      toast(
         <p className="text-red-400 font-semibold flex items-center gap-2">
            <OctagonX className="w-7 h-7 stroke-red-400" />
            Something went wrong while using the file/directory dialog
         </p>,
      );
   };
   return (
      <div className="center h-screen w-screen flex">
         <div className="border border-accent rounded-md p-3 min-w-[400px] space-y-3">
            <div className="flex items-center gap-3">
               <Folder className="w-5 h-5" />
               <h1 className="font-bold text-lg"> Choose your space </h1>
            </div>
            <p className="text-gray-400">
               Choose the folder which your books are located
            </p>
            <div className="flex items-center gap-2 mt-4">
               <MyInput
                  readOnly
                  value={filePath}
               />
               <IconButton
                  className="w-9 h-9 shrink-0 bg-accent/40 hover:bg-accent/80 rounded-sm"
                  onClick={handleChooseDir}
               >
                  <Folder className="w-4 h-4" />
               </IconButton>
            </div>
            <div className="flex items-center gap-2 justify-end mt-4">
               <MyButton
                  variant="default"
                  className="font-semibold bg-gray-300 text-gray-800 hover:bg-gray-300/80 w-full"
                  disabled={!filePath}
                  onClick={() => {
                     setConfig({ ...config, spacePath: filePath });
                     navigate({ to: "/" });
                  }}
               >
                  Start
               </MyButton>
            </div>
         </div>
      </div>
   );
}
