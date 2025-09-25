import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addSkill = mutation({
				args: {
					name: v.string(),
					icon: v.optional(v.string()),
					teachLevel: v.string(),
					learnLevel: v.string(),
				},
	handler: async (ctx, args) => {
					await ctx.db.insert("skills", {
						name: args.name,
						icon: args.icon ?? "",
						teachLevel: args.teachLevel,
						learnLevel: args.learnLevel,
					});
		return "Skill added";
	},
});
