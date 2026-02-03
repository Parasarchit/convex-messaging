import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const heartbeat = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch("presence", existing._id, {
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("presence", {
        userId: identity.subject,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getUserStatus = query({
  args: {
    userId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});
