import { createFileRoute, redirect } from "@tanstack/react-router";
import { createContext, useState } from "react";
import { useConfigStore } from "@/stores/configStore";
import { getBooks } from "@/services/book";
import { SpacePathInvalidError } from "@/lib/errors/spacePathInvalidError";
import PDFReader from "@/components/PDF/PDFReader";
export const Route = createFileRoute("/books/$bookId")({
   loader: async ({ params }) => {
      const bookId = params.bookId;
      const setupPath = "/setup";
      const stateStr = useConfigStore.getState().config.spacePath;
      if (!stateStr) {
         throw redirect({ to: setupPath });
      }
      const res = await getBooks(stateStr);
      if (!res.success) {
         throw new SpacePathInvalidError("");
      }
      const book = res.data.find((book) => book.id === Number(bookId));
      if (!book) {
         console.error("Book not found with id: ", bookId);
         throw redirect({ to: "/" });
      }
      return {
         book,
      };
   },
   onError: (error) => {
      if (error instanceof SpacePathInvalidError) {
         throw redirect({ to: "/setup" });
      }
      throw error;
   },
   component: BookViewerPage,
});

type BookViewerLayoutContextType = {
   sideBarVisible: boolean;
   setSideBarVisible: (visible: boolean) => void;
};
export const BookViewerLayoutContext =
   createContext<BookViewerLayoutContextType>({
      sideBarVisible: true,
      setSideBarVisible: () => {},
   });
function BookViewerPage() {
   const { book } = Route.useLoaderData();
   const [sideBarVisible, setSideBarVisible] = useState(true);
   return (
      <div className="flex h-screen w-full">
         <PDFReader documentPath={book.filePath} />
      </div>
   );
   // return (
   //    <BookViewerLayoutContext.Provider
   //       value={{ sideBarVisible, setSideBarVisible }}
   //    >
   //       <div className="flex flex-row h-screen overflow-hidden relative">
   //          <div
   //             className={cn(
   //                "transition-all overflow-hidden shrink-0 ease-linear duration-200",
   //                sideBarVisible ? "w-[300px]" : "w-0",
   //             )}
   //          >
   //             <div className="w-[300px] h-full border-r border-accent">
   //                <PdfOutlineSidebar />
   //             </div>
   //          </div>

   //          <div className="w-full relative">
   //             <div className="absolute top-0 left-0 right-0 z-50">
   //                <PdfToolbar />
   //             </div>
   //             <PdfViewer />
   //          </div>
   //       </div>
   //       <BookChatModal open={false} onClose={() => {}} />
   //    </BookViewerLayoutContext.Provider>
   // );
}
