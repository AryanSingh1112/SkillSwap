import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userName: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    learn: v.optional(v.array(v.string())),
    teach: v.optional(v.array(v.string())),
    learnLevels: v.optional(v.array(v.object({ skill: v.string(), level: v.string() }))),
    teachLevels: v.optional(v.array(v.object({ skill: v.string(), level: v.string() }))),
  }).index("by_email", ["email"]),

  matches: defineTable({
    userA: v.id("users"),  // first user
    userB: v.id("users"),  // second user
    roomId: v.string(),     // permanent meeting room
    createdAt: v.number(),
  })
    .index("by_userA", ["userA"])
    .index("by_userB", ["userB"]),

  skills: defineTable({
    name: v.string(),
    icon: v.optional(v.string()),
    teachLevel: v.string(),
    learnLevel: v.string(),
  }),
});
