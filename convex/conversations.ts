import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("clerkId"), identity.subject))
      .collect();

    return Promise.all(
      users.map(async (user) => {
        const participantClerkIds = [identity.subject, user.clerkId];

        const validUserIds = participantClerkIds.filter(Boolean) as string[];

        const sortedIds = validUserIds.sort().join(",");

        const existingConversation = await ctx.db
          .query("conversations")
          .collect()
          .then((convs) =>
            convs.find(
              (conv) => conv.participantIds.sort().join(",") === sortedIds
            )
          );

        if (!existingConversation) {
          return {
            user,
            lastMessage: null,
          };
        }

        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", existingConversation._id)
          )
          .order("desc")
          .collect();

        const lastMessage = messages[0] || null;

        const conversationReads = await ctx.db
          .query("conversationReads")
          .withIndex("by_conversationId_by_userId", (q) =>
            q
              .eq("conversationId", existingConversation._id)
              .eq("userId", identity.subject)
          )
          .unique();

        const lastReadMessageId = conversationReads?.lastReadMessageId;

        const unreadCount = lastReadMessageId
          ? messages.findIndex((msg) => msg._id === lastReadMessageId)
          : messages.length;

        return {
          user,
          conversation: existingConversation,
          lastMessage,
          unreadCount: Math.max(0, unreadCount),
        };
      })
    );
  },
});

export const getOrCreateConversation = mutation({
  args: {
    receiverClerkId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const participantClerkIds = [identity.subject, args.receiverClerkId];

    const validUserIds = participantClerkIds.filter(Boolean) as string[];

    const sortedIds = validUserIds.sort().join(",");

    const existingConversation = await ctx.db
      .query("conversations")
      .collect()
      .then((convs) =>
        convs.find((conv) => conv.participantIds.sort().join(",") === sortedIds)
      );

    if (existingConversation) {
      return existingConversation;
    }

    const conversationId = await ctx.db.insert("conversations", {
      participantIds: validUserIds,
      typing: [],
    });

    await Promise.all([
      ctx.db.insert("conversationReads", {
        conversationId,
        userId: identity.subject,
        lastReadMessageId: undefined,
      }),
      ctx.db.insert("conversationReads", {
        conversationId,
        userId: args.receiverClerkId,
        lastReadMessageId: undefined,
      }),
    ]);

    return await ctx.db.get(conversationId);
  },
});

export const getConversationById = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (
      !conversation ||
      !conversation.participantIds.includes(identity.subject)
    ) {
      throw new Error("Conversation not found");
    }

    return conversation;
  },
});

export const isTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch("conversations", args.conversationId, {
      typing: args.isTyping
        ? [...conversation.typing, identity.subject]
        : conversation.typing.filter((id) => id !== identity.subject),
    });
  },
});

export const markConversationAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", conversation._id)
      )
      .order("desc")
      .first();

    const userConversationReads = await ctx.db
      .query("conversationReads")
      .withIndex("by_conversationId_by_userId", (q) =>
        q.eq("conversationId", conversation._id).eq("userId", identity.subject)
      )
      .unique();

    if (userConversationReads?._id) {
      await ctx.db.patch("conversationReads", userConversationReads._id, {
        lastReadMessageId: lastMessage?._id,
      });
    }
  },
});

export const getLastReadMessage = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const receiverId = conversation.participantIds.find(
      (id) => id !== identity.subject
    );

    if (!receiverId) {
      throw new Error("Receiver not found");
    }

    return await ctx.db
      .query("conversationReads")
      .withIndex("by_conversationId_by_userId", (q) =>
        q.eq("conversationId", conversation._id).eq("userId", receiverId)
      )
      .unique();
  },
});
