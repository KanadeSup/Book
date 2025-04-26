import { DefaultLayout, Title } from "@/layouts/DefaultLayout";
import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/")({
   component: Index,
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
