import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "@/assets/styles/fonts.css";
import "@/assets/styles/tailwind.css";
import "@/assets/styles/common.css";
import { useEffect } from "react";
import { useConfigStore } from "@/stores/configStore";

export const Route = createRootRoute({
   component: Root,
});

function Root() {
   const { config } = useConfigStore();
   const navigate = useNavigate();
   useEffect(() => {
      if (config.spacePath) return;
      navigate({ to: "/setup" });
   }, [config.spacePath, navigate]);
   return (
      <>
         <Outlet />
         <TanStackRouterDevtools />
      </>
   );
}
