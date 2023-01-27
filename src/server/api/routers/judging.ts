import { Prize } from "@prisma/client";
import { z } from "zod";
import type { HelixUser } from "../../../types/user";
import cmp from "../../controllers/cmp";
import { getNext } from "../../controllers/getNext";
import authMiddleware from "../middleware/authMiddleware";

import { createTRPCRouter, publicProcedure } from "../trpc";

const protectedProcedure = publicProcedure.use(authMiddleware);

export const judgingRouter = createTRPCRouter({
  getNext: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx?.session?.user as HelixUser;
    const judge = await ctx.prisma.judge.findFirst({
      where: { helixId: user._id },
      include: {
        prizeAssignments: {
          include: {
            leadingProject: {
              include: {
                judgingInstances: true,
              },
            },
          },
        },
        ignoredProjects: true,
      },
    });
    if (!judge) {
      return null;
    }

    return await getNext(judge, ctx.prisma);
  }),
  compare: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
        winnerId: z.string(),
        loserId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: Update computation based on current pair-wise comparison
      const user = ctx?.session?.user as HelixUser;
      const prize = (await ctx.prisma.prize.findFirst({
        where: { id: input.prizeId },
      })) as Prize;
      const judge = await ctx.prisma.judge.findFirst({
        where: { helixId: user._id },
      });
      const winner = await ctx.prisma.judgingInstance.findFirst({
        where: { prizeId: input.prizeId, projectId: input.winnerId },
      });
      const loser = await ctx.prisma.judgingInstance.findFirst({
        where: { prizeId: input.prizeId, projectId: input.loserId },
      });

      await cmp(winner, loser, judge, ctx.prisma);

      return;
    }),
  getTopProjects: protectedProcedure
    .input(z.object({ prizeId: z.string() }))
    .query(({ ctx, input }) => {
      // TODO: return top projects for the specified prize
      const user = ctx?.session?.user;
      return;
    }),
});
