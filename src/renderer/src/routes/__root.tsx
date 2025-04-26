import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "@/assets/styles/fonts.css";
import "@/assets/styles/tailwind.css";
import "@/assets/styles/common.css";

export const Route = createRootRoute({
   component: () => (
      <>
         <Outlet />
         <TanStackRouterDevtools />
      </>
   ),
});
