import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Respect the Vite base path (e.g. "/<repo>/" on GitHub Pages) so client-side
  // routing works when the site is not served from the domain root.
  const baseUrl = import.meta.env.BASE_URL;
  const basepath = baseUrl === "/" ? "/" : baseUrl.replace(/\/$/, "");

  const router = createRouter({
    routeTree,
    basepath,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
