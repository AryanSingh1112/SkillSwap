/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schemaNew from "../convex/schema";
import schemaOld from "./baseline/convex/schema";
import { api } from "../convex/_generated/api";
import { findMatch as findMatchNew } from "../convex/match";
import { findMatch as findMatchOld } from "./baseline/convex/match";

const modulesNew = import.meta.glob("../convex/**/*.ts");
const modulesOld = import.meta.glob("./baseline/convex/**/*.ts");

const BASE = ["react","python","guitar","piano","chess","go","rust","sql","design","yoga","spanish","french","drums","excel","photography","cooking","sketching","java","swift","math"];
const POOL = Number(process.env.POOL_SIZE) > 20 ? Array.from({ length: Number(process.env.POOL_SIZE) }, (_, i) => `skill${i}`) : BASE;
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
function genUsers(n: number, seed: number) {
  const r = rng(seed);
  const pick = (k: number) => {
    const out = new Set<string>();
    while (out.size < k) out.add(POOL[Math.floor(r() * POOL.length)]);
    return [...out];
  };
  return Array.from({ length: n }, (_, i) => {
    const learn = pick(Math.floor(r() * 3));
    const teach = pick(Math.floor(r() * 3));
    const lv = (xs: string[]) => xs.map((skill) => ({ skill, level: LEVELS[Math.floor(r() * 3)] }));
    return { email: `u${i}@x.io`, userName: `u${i}`, imageUrl: "", learn, teach, learnLevels: lv(learn), teachLevels: lv(teach) };
  });
}

// Wrap ctx.db so we can count documents returned to the handler.
function counted(db: any, counter: { docs: number }) {
  const wrapQ = (q: any): any =>
    new Proxy(q, {
      get(t, p) {
        const v = t[p];
        if (typeof v !== "function") return v;
        return (...a: any[]) => {
          const res = v.apply(t, a);
          if (p === "collect" || p === "take") return res.then((x: any[]) => ((counter.docs += x.length), x));
          if (p === "first" || p === "unique") return res.then((x: any) => ((counter.docs += x ? 1 : 0), x));
          return res && typeof res === "object" && !(res instanceof Promise) ? wrapQ(res) : res;
        };
      },
    });
  return new Proxy(db, {
    get(t, p) {
      const v = t[p];
      if (p === "query") return (tb: string) => wrapQ(t.query(tb));
      if (p === "get") return async (...a: any[]) => { const x = await t.get(...a); if (x) counter.docs++; return x; };
      return typeof v === "function" ? v.bind(t) : v;
    },
  });
}

async function setup(n: number, seed: number) {
  const users = genUsers(n, seed);
  const old = convexTest(schemaOld, modulesOld);
  const neu = convexTest(schemaNew, modulesNew);
  await old.run(async (ctx) => { for (const u of users) await ctx.db.insert("users", u); });
  // New side goes through the real mutation so index maintenance is exercised.
  await neu.run(async (ctx) => {
    for (const u of users) {
      const id = await ctx.db.insert("users", u);
      const { syncSkillIndex } = await import("../convex/skillIndex");
      await syncSkillIndex(ctx as any, id, u.learn, u.teach);
    }
  });
  return { users, old, neu };
}

async function run(t: any, fn: any, args: any) {
  const counter = { docs: 0 };
  const t0 = performance.now();
  const res = await t.run(async (ctx: any) => fn._handler({ ...ctx, db: counted(ctx.db, counter) }, args));
  return { res, ms: performance.now() - t0, docs: counter.docs };
}
const strip = (r: any) => r && { email: r.email, q: r.matchQuality, d: r.matchDetails };

describe("findMatch equivalence (old full scan vs inverted index)", () => {
  it("returns the same match for every user, in both modes", async () => {
    const { users, old, neu } = await setup(400, 7);
    let compared = 0, matched = 0;
    for (const u of users) {
      const modes: any[] = [{ email: u.email }];
      if (u.learn.length && u.teach.length) modes.push({ email: u.email, learnSkill: u.learn[0].toUpperCase(), teachSkill: u.teach[0] });
      for (const args of modes) {
        const a = await run(old, findMatchOld, args);
        const b = await run(neu, findMatchNew, args);
        expect(strip(b.res)).toEqual(strip(a.res));
        compared++; if (a.res) matched++;
      }
    }
    console.log(`equivalence: ${compared} queries compared, ${matched} with a match, 0 differences`);
  });
});

describe("findMatch benchmark", () => {
  for (const n of [1000, 5000, 10000]) {
    it(`n=${n}`, async () => {
      const { users, old, neu } = await setup(n, 42);
      const sample = users.filter((u) => u.learn.length && u.teach.length).slice(0, 25);
      const stats = { old: { ms: [] as number[], docs: [] as number[] }, neu: { ms: [] as number[], docs: [] as number[] } };
      for (const u of sample) {
        const args = { email: u.email };
        const a = await run(old, findMatchOld, args); const b = await run(neu, findMatchNew, args);
        stats.old.ms.push(a.ms); stats.old.docs.push(a.docs); stats.neu.ms.push(b.ms); stats.neu.docs.push(b.docs);
      }
      const med = (x: number[]) => [...x].sort((p, q) => p - q)[Math.floor(x.length / 2)];
      console.log(`BENCH pool=${POOL.length} n=${n} samples=${sample.length} | old: docs=${med(stats.old.docs)} p50=${med(stats.old.ms).toFixed(1)}ms | new: docs=${med(stats.neu.docs)} p50=${med(stats.neu.ms).toFixed(1)}ms`);
    });
  }
});
