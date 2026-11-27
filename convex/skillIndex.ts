import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export function skillKey(value: string) {
  return value.trim().toLocaleLowerCase();
}

/** Rebuilds the inverted-index rows for one user so they mirror learn/teach. */
export async function syncSkillIndex(
  ctx: MutationCtx,
  userId: Id<"users">,
  learn: string[] = [],
  teach: string[] = [],
) {
  const wanted = new Set<string>();
  for (const s of learn) if (skillKey(s)) wanted.add(`learn\u0000${skillKey(s)}`);
  for (const s of teach) if (skillKey(s)) wanted.add(`teach\u0000${skillKey(s)}`);

  const existing = await ctx.db
    .query("userSkills")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const have = new Set<string>();
  for (const row of existing) {
    const id = `${row.kind}\u0000${row.key}`;
    if (wanted.has(id) && !have.has(id)) have.add(id);
    else await ctx.db.delete(row._id);
  }
  for (const id of wanted) {
    if (have.has(id)) continue;
    const [kind, key] = id.split("\u0000") as ["learn" | "teach", string];
    await ctx.db.insert("userSkills", { userId, kind, key });
  }
}

/** One-off: `npx convex run skillIndex:backfill` after deploying the schema. */
export const backfill = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await syncSkillIndex(ctx, user._id, user.learn ?? [], user.teach ?? []);
    }
    return { users: users.length };
  },
});
