import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addSkill = mutation({
  args: {
    email: v.string(),
    learnSkill: v.string(),
    learnLevel: v.string(),
    teachSkill: v.string(),
    teachLevel: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim();
    if (!email) {
      throw new Error("A user email is required to save skills.");
    }

    const existing = await ctx.db
      .query("skills")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    const combinedSkill = { ...args, email };
    const [document, ...duplicates] = existing;

    if (document) {
      await ctx.db.replace(document._id, combinedSkill);
      await Promise.all(duplicates.map((duplicate) => ctx.db.delete(duplicate._id)));
      return "Skills saved";
    }

    await ctx.db.insert("skills", combinedSkill);
    return "Skills saved";
  },
});
