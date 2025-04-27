import { ErrorComponent } from "@/components/Error/ErrorComponent";
import { DefaultLayout, Title } from "@/layouts/DefaultLayout";
import { SpacePathInvalidError } from "@/lib/errors/spacePathInvalidError";
import { UnexceptionError } from "@/lib/errors/unexceptionError";
import { getBooks } from "@/services/book";
import { ConfigStore } from "@/stores/configStore";
import { LocalStorageState } from "@/types/zustand.types";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { JSX } from "react";

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
         return res.data;
      }
      console.error("routes/index.tsx - createFileRoute(): ", res.errorMessage);
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
   return (
      <DefaultLayout>
         <Title>
            <h1 className="font-semibold text-lg"> Books </h1>
         </Title>
      </DefaultLayout>
   );
}
