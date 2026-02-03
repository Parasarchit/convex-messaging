import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: identity.subject,
      text: args.text,
    });

     const conversationReads = await ctx.db
       .query("conversationReads")
       .withIndex("by_conversationId_by_userId", (q) =>
         q
           .eq("conversationId", args.conversationId)
           .eq("userId", identity.subject)
       )
       .unique();
    
    if (conversationReads?._id) {
      await ctx.db.patch("conversationReads", conversationReads._id, {
        lastReadMessageId: messageId,
      })
    }

    return await ctx.db.get(messageId);
  },
});
