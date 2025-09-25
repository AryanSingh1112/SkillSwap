// ✅ Update meeting link for a match
export const setMeetingLink = mutation({
  args: { matchId: v.id("matches"), meetingLink: v.string() },
  handler: async (ctx, args) => {
    // meetingLink is not in schema, so do not patch it
    // If you want to store meetingLink, add it to schema first
    // await ctx.db.patch(args.matchId, { meetingLink: args.meetingLink });
    // Previous behavior: do nothing or handle as needed
  },
});
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// ✅ Find or create match
export const findMatch = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // 1️⃣ Get current user
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    if (!currentUser) return null;

  const learnLevels = currentUser.learnLevels || [];
  const teachLevels = currentUser.teachLevels || [];

    // 2️⃣ Fetch all other users
    const candidates = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("email"), args.email))
      .collect();

    // 3️⃣ Check for existing match
    for (const u of candidates) {
      const existingMatch = await ctx.db
        .query("matches")
        .filter(
          (q) =>
            q.or(
              q.and(
                q.eq(q.field("userA"), currentUser._id),
                q.eq(q.field("userB"), u._id)
              ),
              q.and(
                q.eq(q.field("userA"), u._id),
                q.eq(q.field("userB"), currentUser._id)
              )
            )
        )
        .first();

      if (existingMatch) {
        // Return opponent with existing roomId
        return { ...u, roomId: existingMatch.roomId };
      }
    }

    // 4️⃣ Strict match → both directions (skill AND level must match)
    const strict = candidates.find((u) => {
      const otherLearnLevels = u.learnLevels || [];
      const otherTeachLevels = u.teachLevels || [];
      // UserA wants to learn X at level Y, UserB can teach X at level Y
      const teachMatch = learnLevels.some(({ skill, level }) =>
        otherTeachLevels.some((ot) => ot.skill === skill && ot.level === level)
      );
      // UserA can teach X at level Y, UserB wants to learn X at level Y
      const learnMatch = teachLevels.some(({ skill, level }) =>
        otherLearnLevels.some((ol) => ol.skill === skill && ol.level === level)
      );
      return teachMatch && learnMatch;
    });

    if (strict) {
      const roomId = crypto.randomUUID();

      // ✅ Create new match
      await ctx.db.insert("matches", {
        userA: currentUser._id,
        userB: strict._id,
        roomId,
        createdAt: Date.now(),
      });

      return { ...strict, roomId };
    }

    // 5️⃣ Loose match → at least one direction (skill AND level must match)
    const loose = candidates.find((u) => {
      const otherLearnLevels = u.learnLevels || [];
      const otherTeachLevels = u.teachLevels || [];
      const teachMatch = learnLevels.some(({ skill, level }) =>
        otherTeachLevels.some((ot) => ot.skill === skill && ot.level === level)
      );
      const learnMatch = teachLevels.some(({ skill, level }) =>
        otherLearnLevels.some((ol) => ol.skill === skill && ol.level === level)
      );
      return teachMatch || learnMatch;
    });

    if (loose) {
      const roomId = crypto.randomUUID();

      await ctx.db.insert("matches", {
        userA: currentUser._id,
        userB: loose._id,
        roomId,
        createdAt: Date.now(),
      });

      return { ...loose, roomId };
    }

    // 6️⃣ No match found
    return null;
  },
});
