export const removeSkill = mutation({
  args: {
    email: v.string(),
    skill: v.string(),
    type: v.string(), // 'learn' or 'teach'
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    let updatedLearn = user.learn || [];
    let updatedTeach = user.teach || [];

    if (args.type === "learn") {
      updatedLearn = updatedLearn.filter((s) => s !== args.skill);
    } else if (args.type === "teach") {
      updatedTeach = updatedTeach.filter((s) => s !== args.skill);
    }

    await ctx.db.patch(user._id, {
      learn: updatedLearn,
      teach: updatedTeach,
    });

    return "Skill removed successfully";
  },
});
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a user
export const createUser = mutation({
  args: {
    email: v.string(),
    userName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      await ctx.db.insert("users", {
        email: args.email,
        userName: args.userName,
        imageUrl: args.imageUrl,
        learn: [], // initialize empty
        teach: [], // initialize empty
      });
      return "Inserted User";
    }
    return "User already exists";
  },
});

// Update skills (append instead of overwrite)
export const updateSkills = mutation({
  args: {
    email: v.string(),
    learn: v.optional(v.array(v.string())),
    teach: v.optional(v.array(v.string())),
    learnLevels: v.optional(v.array(v.object({ skill: v.string(), level: v.string() }))),
    teachLevels: v.optional(v.array(v.object({ skill: v.string(), level: v.string() }))),
    userName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    // If user does not exist, create them with all info
    if (!user) {
      await ctx.db.insert("users", {
        email: args.email,
        userName: args.userName || "",
        imageUrl: args.imageUrl || "",
        learn: args.learn || [],
        teach: args.teach || [],
        learnLevels: args.learnLevels || [],
        teachLevels: args.teachLevels || [],
      });
      return "User created and skills set";
    }

    // Append skills while avoiding duplicates
    const updatedLearn = Array.from(
      new Set([...(user.learn || []), ...(args.learn || [])])
    );
    const updatedTeach = Array.from(
      new Set([...(user.teach || []), ...(args.teach || [])])
    );

    // Merge levels for each skill, updating or adding
    function mergeLevels(existing: any[] = [], incoming: any[] = []) {
      const map = new Map();
      existing.forEach(({ skill, level }) => map.set(skill, level));
      incoming.forEach(({ skill, level }) => map.set(skill, level));
      return Array.from(map.entries()).map(([skill, level]) => ({ skill, level }));
    }
    const updatedLearnLevels = mergeLevels(user.learnLevels, args.learnLevels ?? []);
    const updatedTeachLevels = mergeLevels(user.teachLevels, args.teachLevels ?? []);

    // Always overwrite userName and imageUrl, even if blank
    const patchData: any = {
      learn: updatedLearn,
      teach: updatedTeach,
      learnLevels: updatedLearnLevels,
      teachLevels: updatedTeachLevels,
      userName: args.userName ?? "",
      imageUrl: args.imageUrl ?? "",
    };

    await ctx.db.patch(user._id, patchData);

    return "Skills and profile updated successfully";
  },
});

// Fetch a user by email
export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});
