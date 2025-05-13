import { VerticleBookCard } from "@/components/Card/VerticleBookCard";
import { ErrorComponent } from "@/components/Error/ErrorComponent";
import { DefaultLayout, Title } from "@/layouts/DefaultLayout";
import { SpacePathInvalidError } from "@/lib/errors/spacePathInvalidError";
import { getBookPdfMetaData, getBooks } from "@/services/book";
import { ConfigStore } from "@/stores/configStore";
import { LocalStorageState } from "@/types/zustand.types";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { JSX, useEffect, useState } from "react";

export const Route = createFileRoute("/")({
   component: Index,
   errorComponent: ErrorComponent,
   loader: async () => {
      const setupPath = "/setup";
      const stateStr = localStorage.getItem("config-storage");
      if (!stateStr) {
         throw redirect({ to: setupPath });
      }
      const stateData = JSON.parse(stateStr) as LocalStorageState<ConfigStore>;
      if (!stateData.state.config.spacePath) {
         throw redirect({ to: setupPath });
      }
      const res = await getBooks(stateData.state.config.spacePath);
      if (res.success) {
         return {
            books: res.data,
         };
      }
      throw new SpacePathInvalidError("");
   },
   onError: (error) => {
      if (error instanceof SpacePathInvalidError) {
         throw redirect({ to: "/setup" });
      }
      throw error;
   },
});

function Index(): JSX.Element {
   const loaderData = Route.useLoaderData();
   const [books, setBooks] = useState(loaderData.books);
   useEffect(() => {
      async function updateBookMetaData() {
         for (const book of books) {
            const metaData = await getBookPdfMetaData(book.filePath);
            book.metaData = metaData;
         }
         setBooks([...books])
      }
      updateBookMetaData();
   }, []);
   return (
      <DefaultLayout>
         <Title>
            <h1 className="font-semibold text-lg"> Books </h1>
         </Title>
         <div className="grid grid-cols-5 gap-3 p-5 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
            {books.map((book) => (
               <VerticleBookCard
                  key={book.id}
                  title={book.metaData.title ?? book.fileName}
                  cover={book.metaData.cover}
               />
            ))}
         </div>
      </DefaultLayout>
   );
}
