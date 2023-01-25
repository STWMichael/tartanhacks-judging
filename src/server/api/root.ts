import { createTRPCRouter } from "./trpc";
import { judgingRouter } from "./routers/judging";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  judging: judgingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
