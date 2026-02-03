import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  }).index("by_clerkId", ["clerkId"]),
  conversations: defineTable({
    participantIds: v.array(v.string()),
    typing: v.array(v.string()),
  }),
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    text: v.string(),
  }).index("by_conversationId", ["conversationId"]),
  conversationReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    lastReadMessageId: v.optional(v.id("messages")),
  }).index("by_conversationId_by_userId", ["conversationId", "userId"]),
  presence: defineTable({
    userId: v.string(), 
    lastSeen: v.number(),
  }).index("by_userId", ["userId"]),
});
