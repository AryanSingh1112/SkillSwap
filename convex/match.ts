import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type SkillLevel = { skill: string; level: string };
type SkillMatch = {
  skill: string;
  yourLevel: string | null;
  theirLevel: string | null;
  exactLevel: boolean;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function findSkillMatches(
  yourSkills: string[],
  yourLevels: SkillLevel[],
  theirSkills: string[],
  theirLevels: SkillLevel[],
): SkillMatch[] {
  const theirSkillsByName = new Map(
    theirSkills.map((skill) => [normalize(skill), skill]),
  );

  return yourSkills.flatMap((skill) => {
    const theirSkill = theirSkillsByName.get(normalize(skill));
    if (!theirSkill) return [];

    const yourLevel =
      yourLevels.find((entry) => normalize(entry.skill) === normalize(skill))
        ?.level ?? null;
    const theirLevel =
      theirLevels.find(
        (entry) => normalize(entry.skill) === normalize(theirSkill),
      )?.level ?? null;

    return [{
      skill,
      yourLevel,
      theirLevel,
      exactLevel:
        yourLevel !== null &&
        theirLevel !== null &&
        normalize(yourLevel) === normalize(theirLevel),
    }];
  });
}

export const findMatch = mutation({
  args: {
    email: v.string(),
    learnSkill: v.optional(v.string()),
    teachSkill: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLocaleLowerCase();
    if (!email) return null;
    const hasTargetSkills = Boolean(args.learnSkill?.trim() && args.teachSkill?.trim());
    if (Boolean(args.learnSkill?.trim()) !== Boolean(args.teachSkill?.trim())) {
      throw new Error("Both target skills are required for a focused match.");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim()))
      .first();
    if (!currentUser) return null;

    const selectedLearnSkill = hasTargetSkills
      ? currentUser.learn?.find(
          (skill) => normalize(skill) === normalize(args.learnSkill!),
        )
      : undefined;
    const selectedTeachSkill = hasTargetSkills
      ? currentUser.teach?.find(
          (skill) => normalize(skill) === normalize(args.teachSkill!),
        )
      : undefined;

    if (hasTargetSkills && (!selectedLearnSkill || !selectedTeachSkill)) {
      return null;
    }

    const currentLearnSkills = hasTargetSkills
      ? [selectedLearnSkill!]
      : currentUser.learn ?? [];
    const currentTeachSkills = hasTargetSkills
      ? [selectedTeachSkill!]
      : currentUser.teach ?? [];

    // Look candidates up through the inverted skill index instead of scanning
    // every user: people who teach what I learn, and who learn what I teach.
    const idsFor = async (skills: string[], kind: "learn" | "teach") => {
      const found = new Set<Id<"users">>();
      const rows = await Promise.all(
        [...new Set(skills.map(normalize))].map((key) =>
          ctx.db
            .query("userSkills")
            .withIndex("by_key_kind", (q) => q.eq("key", key).eq("kind", kind))
            .collect(),
        ),
      );
      for (const group of rows) for (const row of group) found.add(row.userId);
      return found;
    };
    const teachers = await idsFor(currentLearnSkills, "teach");
    const learners = await idsFor(currentTeachSkills, "learn");
    const candidateIds = hasTargetSkills
      ? [...teachers].filter((id) => learners.has(id))
      : [...new Set([...teachers, ...learners])];
    const fetched = await Promise.all(candidateIds.map((id) => ctx.db.get(id)));
    // Same tie-break as the old full scan: earliest-created user wins.
    const candidates = fetched
      .filter((user) => user !== null)
      .sort((a, b) => a._creationTime - b._creationTime);
    const otherUsers = candidates.filter(
      (candidate) =>
        normalize(candidate.email) !== email &&
        ((candidate.learn?.length ?? 0) > 0 ||
          (candidate.teach?.length ?? 0) > 0),
    );

    const rankedCandidates = otherUsers
      .map((candidate) => {
        const youLearn = findSkillMatches(
          currentLearnSkills,
          currentUser.learnLevels ?? [],
          candidate.teach ?? [],
          candidate.teachLevels ?? [],
        );
        const youTeach = findSkillMatches(
          currentTeachSkills,
          currentUser.teachLevels ?? [],
          candidate.learn ?? [],
          candidate.learnLevels ?? [],
        );
        const exactLearn = youLearn.filter((match) => match.exactLevel).length;
        const exactTeach = youTeach.filter((match) => match.exactLevel).length;
        const mutualExact = exactLearn > 0 && exactTeach > 0;
        const mutualSkills = youLearn.length > 0 && youTeach.length > 0;
        const exactMatches = exactLearn + exactTeach;
        const directionsMatched =
          Number(youLearn.length > 0) + Number(youTeach.length > 0);

        if (directionsMatched === 0) return null;
        if (hasTargetSkills && directionsMatched !== 2) return null;

        const score = mutualExact
          ? 4
          : mutualSkills
            ? 3
            : exactMatches > 0
              ? 2
              : 1;

        return {
          candidate,
          youLearn,
          youTeach,
          score,
          exactMatches,
          directionsMatched,
        };
      })
      .filter((match) => match !== null)
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.exactMatches - a.exactMatches ||
          b.directionsMatched - a.directionsMatched,
      );

    const bestMatch = rankedCandidates[0];
    if (!bestMatch) return null;

    const matchesByUser = await Promise.all([
      ctx.db
        .query("matches")
        .withIndex("by_userA", (q) => q.eq("userA", currentUser._id))
        .collect(),
      ctx.db
        .query("matches")
        .withIndex("by_userB", (q) => q.eq("userB", currentUser._id))
        .collect(),
    ]);
    const existingMatch = [...matchesByUser[0], ...matchesByUser[1]].find(
      (match) =>
        (match.userA === currentUser._id &&
          match.userB === bestMatch.candidate._id) ||
        (match.userB === currentUser._id &&
          match.userA === bestMatch.candidate._id),
    );
    const roomId = existingMatch?.roomId ?? crypto.randomUUID();

    if (!existingMatch) {
      await ctx.db.insert("matches", {
        userA: currentUser._id,
        userB: bestMatch.candidate._id,
        roomId,
        createdAt: Date.now(),
      });
    }

    const matches = [...bestMatch.youLearn, ...bestMatch.youTeach];
    const hasLevelFallback = matches.some((match) => !match.exactLevel);

    return {
      ...bestMatch.candidate,
      roomId,
      matchQuality: hasLevelFallback ? "skill" as const : "exact" as const,
      matchDetails: {
        youLearn: bestMatch.youLearn,
        youTeach: bestMatch.youTeach,
        hasLevelFallback,
      },
    };
  },
});
