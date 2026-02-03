import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const add = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      imageUrl: args.imageUrl,
    });
  },
});

export const remove = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (user) {
      return await ctx.db.delete("users", user._id);
    }
  },
});

export const update = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (user) {
      return await ctx.db.patch("users", user._id, {
        name: args.name,
        imageUrl: args.imageUrl,
      });
    }
  }
})
