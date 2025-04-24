import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/")({
   component: Index,
});

function Index(): JSX.Element {
   return (
      <div className="p-2">
         <h3>Welcome Home!</h3>
         <Button>
            fuck
         </Button>
         <Input type="email" placeholder="Email" className="focus-visible:ring-0 focus-visible:outline-none"/>
      </div>
   );
}
