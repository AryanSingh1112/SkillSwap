import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { syncSkillIndex } from "./skillIndex";

export const removeSkill = mutation({
  args: {
    email: v.string(),
    skill: v.string(),
    type: v.union(v.literal("learn"), v.literal("teach")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updatedLearn =
      args.type === "learn"
        ? (user.learn ?? []).filter((skill) => skill !== args.skill)
        : user.learn ?? [];
    const updatedTeach =
      args.type === "teach"
        ? (user.teach ?? []).filter((skill) => skill !== args.skill)
        : user.teach ?? [];
    const updatedLearnLevels = (user.learnLevels ?? []).filter(
      ({ skill }) => skill !== args.skill || args.type !== "learn",
    );
    const updatedTeachLevels = (user.teachLevels ?? []).filter(
      ({ skill }) => skill !== args.skill || args.type !== "teach",
    );

    await ctx.db.patch(user._id, {
      learn: updatedLearn,
      teach: updatedTeach,
      learnLevels: updatedLearnLevels,
      teachLevels: updatedTeachLevels,
    });
    await syncSkillIndex(ctx, user._id, updatedLearn, updatedTeach);

    const skillDocuments = await ctx.db
      .query("skills")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    if (updatedLearn.length === 0 && updatedTeach.length === 0) {
      await Promise.all(skillDocuments.map((document) => ctx.db.delete(document._id)));
    } else {
      const combinedSkill = {
        email: args.email,
        learnSkill: updatedLearn.join(", "),
        learnLevel: updatedLearn
          .map((skill) => updatedLearnLevels.find((entry) => entry.skill === skill)?.level ?? "")
          .join(", "),
        teachSkill: updatedTeach.join(", "),
        teachLevel: updatedTeach
          .map((skill) => updatedTeachLevels.find((entry) => entry.skill === skill)?.level ?? "")
          .join(", "),
      };

      const [existingSkill, ...duplicates] = skillDocuments;
      if (existingSkill) {
        await ctx.db.replace(existingSkill._id, combinedSkill);
        await Promise.all(duplicates.map((document) => ctx.db.delete(document._id)));
      } else {
        await ctx.db.insert("skills", combinedSkill);
      }
    }

    return "Skill removed successfully";
  },
});

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
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      await ctx.db.insert("users", {
        email: args.email,
        userName: args.userName,
        imageUrl: args.imageUrl,
        learn: [], // initialize empty
        teach: [], // initialize empty
      });
      // Empty skills => no index rows needed.
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
    const email = args.email.trim();
    if (!email) {
      throw new Error("A signed-in user email is required to save skills.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    let userId;
    if (!user) {
      userId = await ctx.db.insert("users", {
        email,
        userName: args.userName || "",
        imageUrl: args.imageUrl || "",
        learn: args.learn || [],
        teach: args.teach || [],
        learnLevels: args.learnLevels || [],
        teachLevels: args.teachLevels || [],
      });
    } else {
      const updatedLearn = Array.from(
        new Set([...(user.learn || []), ...(args.learn || [])])
      );
      const updatedTeach = Array.from(
        new Set([...(user.teach || []), ...(args.teach || [])])
      );

      function mergeLevels(
        existing: { skill: string; level: string }[] = [],
        incoming: { skill: string; level: string }[] = [],
      ) {
        const map = new Map<string, string>();
        existing.forEach(({ skill, level }) => map.set(skill, level));
        incoming.forEach(({ skill, level }) => map.set(skill, level));
        return Array.from(map.entries()).map(([skill, level]) => ({ skill, level }));
      }
      const updatedLearnLevels = mergeLevels(user.learnLevels, args.learnLevels ?? []);
      const updatedTeachLevels = mergeLevels(user.teachLevels, args.teachLevels ?? []);

      const patchData = {
        learn: updatedLearn,
        teach: updatedTeach,
        learnLevels: updatedLearnLevels,
        teachLevels: updatedTeachLevels,
        ...(args.userName !== undefined ? { userName: args.userName } : {}),
        ...(args.imageUrl !== undefined ? { imageUrl: args.imageUrl } : {}),
      };

      await ctx.db.patch(user._id, patchData);
      userId = user._id;
    }

    const savedUser = await ctx.db.get(userId);
    if (!savedUser) {
      throw new Error("The user profile could not be verified after saving.");
    }
    await syncSkillIndex(ctx, userId, savedUser.learn ?? [], savedUser.teach ?? []);
    const levelsForSkills = (
      skills: string[],
      levels: { skill: string; level: string }[],
    ) =>
      skills
        .map((skill) => levels.find((entry) => entry.skill === skill)?.level ?? "")
        .join(", ");

    const combinedSkill = {
      email,
      learnSkill: (savedUser.learn ?? []).join(", "),
      learnLevel: levelsForSkills(savedUser.learn ?? [], savedUser.learnLevels ?? []),
      teachSkill: (savedUser.teach ?? []).join(", "),
      teachLevel: levelsForSkills(savedUser.teach ?? [], savedUser.teachLevels ?? []),
    };

    const existingSkills = await ctx.db
      .query("skills")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    const [existingSkill, ...duplicateSkills] = existingSkills;
    let skillId;

    if (existingSkill) {
      await ctx.db.replace(existingSkill._id, combinedSkill);
      skillId = existingSkill._id;
      await Promise.all(
        duplicateSkills.map((duplicate) => ctx.db.delete(duplicate._id)),
      );
    } else {
      skillId = await ctx.db.insert("skills", combinedSkill);
    }

    const savedSkill = await ctx.db.get(skillId);
    if (
      !savedSkill ||
      savedSkill.email !== email ||
      savedSkill.learnSkill !== combinedSkill.learnSkill ||
      savedSkill.learnLevel !== combinedSkill.learnLevel ||
      savedSkill.teachSkill !== combinedSkill.teachSkill ||
      savedSkill.teachLevel !== combinedSkill.teachLevel
    ) {
      throw new Error("The combined skills could not be verified after saving.");
    }

    return { user: savedUser, skill: savedSkill };
  },
});

// Fetch a user by email
export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});
