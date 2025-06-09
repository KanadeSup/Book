import { createFileRoute, redirect } from "@tanstack/react-router";
import { createContext } from "react";
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
   return (
      <div className="flex h-screen w-full">
         <PDFReader documentPath={book.filePath} />
      </div>
   );
}
