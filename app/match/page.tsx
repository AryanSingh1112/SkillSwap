"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlayerCard } from "../_components/PlayerCard";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

function CenterStatus({ status }: { status: "waiting" | "matched" }) {
  if (status === "waiting") {
    return (
      <div className="flex flex-col items-center mx-2 my-6 sm:my-0">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-dashed border-gray-500/50 rounded-full animate-spin" />
          <span className="absolute text-xl font-semibold text-gray-300 animate-pulse">
            ...
          </span>
        </div>
        <div className="mt-3 text-lg font-medium text-gray-400 animate-pulse">
          Finding your match
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex flex-col items-center my-6 sm:my-0">
      {/* !bg-none !text-white overrides the global h1 gradient from globals.css */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold !bg-none !text-white drop-shadow-lg animate-fadeIn text-center">
        Match Found
      </h1>
    </div>
  );
}

type SkillMatch = {
  skill: string;
  yourLevel: string | null;
  theirLevel: string | null;
  exactLevel: boolean;
};

type Opponent = {
  userName?: string;
  teach?: string[];
  learn?: string[];
  _id?: string;
  roomId?: string;
  matchDetails?: {
    youLearn: SkillMatch[];
    youTeach: SkillMatch[];
    hasLevelFallback: boolean;
  };
};

export default function MatchPage() {
  const router = useRouter();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  // ✅ self user data
  const selfData = useQuery(api.user.getUser, email ? { email } : "skip");

  // ✅ mutation for finding match
  const findMatch = useMutation(api.match.findMatch);
  const client = useStreamVideoClient();

  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [status, setStatus] = useState<"waiting" | "matched">("waiting");
  const [noMatch, setNoMatch] = useState(false);
  const [matchError, setMatchError] = useState("");

  useEffect(() => {
    if (!email) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const search = async () => {
      setStatus("waiting");
      setNoMatch(false);
      setMatchError("");

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const learnSkill = searchParams.get("learn")?.trim() || undefined;
        const teachSkill = searchParams.get("teach")?.trim() || undefined;
        const targetSkills =
          learnSkill && teachSkill ? { learnSkill, teachSkill } : {};

        for (let attempt = 0; attempt < 3 && !cancelled; attempt += 1) {
          const result = (await findMatch({
            email,
            ...targetSkills,
          })) as Opponent | null;
          if (cancelled) return;
          if (result) {
          setOpponent(result);
          setStatus("matched");
          return;
          }

          if (attempt < 2) {
          await new Promise<void>((resolve) => {
            timeout = setTimeout(resolve, 4000);
          });
          }
        }
        if (!cancelled) setNoMatch(true);
      } catch {
        if (!cancelled) {
          setMatchError("We couldn’t search for matches. Please try again.");
          setNoMatch(true);
        }
      }
    };

    void search();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [email, findMatch]);

  // ✅ only matched skills
  const matched = useMemo(() => {
    if (!selfData || !opponent) {
      return { selfTeach: [], selfLearn: [], oppTeach: [], oppLearn: [] };
    }

    const youLearn = opponent.matchDetails?.youLearn ?? [];
    const youTeach = opponent.matchDetails?.youTeach ?? [];

    return {
      selfTeach: youTeach.map(({ skill }) => skill),
      selfLearn: youLearn.map(({ skill }) => skill),
      oppTeach: youLearn.map(({ skill }) => skill),
      oppLearn: youTeach.map(({ skill }) => skill),
    };
  }, [selfData, opponent]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Please Wait...
      </div>
    );
  }

  // 🎨 avatars using Dicebear
  const selfAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`;
  const oppAvatar = opponent
    ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${opponent._id}`
    : undefined;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black text-white px-4">
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto z-10">
        {/* Responsive wrapper */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-8 sm:gap-12 md:gap-20">
          {/* Self User */}
          <PlayerCard
            variant="self"
            avatar={selfAvatar}
            name={selfData?.userName || "You"}
            teach={matched.selfTeach.join(", ") || "—"}
            learn={matched.selfLearn.join(", ") || "—"}
            isWaiting={false}
          />

          {/* Status spinner or match found */}
          {!noMatch ? (
            <CenterStatus status={status} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
              <svg
                className="w-14 h-14 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-2a4 4 0 00-4-4h-1a4 4 0 00-4 4v2m6-10a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="text-xl font-semibold text-gray-300">
                No match found
              </span>
              <span className="text-sm text-gray-400 mt-2">
                {matchError || "Try updating your skills or levels to find a match."}
              </span>
            </div>
          )}

          {/* Opponent */}
          <PlayerCard
            variant="opponent"
            avatar={oppAvatar}
            name={opponent?.userName}
            teach={matched.oppTeach.join(", ") || "—"}
            learn={matched.oppLearn.join(", ") || "—"}
            isWaiting={status === "waiting" && !noMatch}
          />
        </div>

        {status === "matched" && opponent?.matchDetails && (
          <div className="mt-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-lg backdrop-blur">
            {opponent.matchDetails.hasLevelFallback ? (
              <p className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                We couldn’t find an exact level match for every shared skill, so
                we matched by skill. You can still learn together at different
                levels.
              </p>
            ) : (
              <p className="mb-4 text-sm font-medium text-emerald-300">
                Great match — your shared skills and levels align.
              </p>
            )}
            <div className="grid gap-3 text-sm text-gray-200 sm:grid-cols-2">
              {opponent.matchDetails.youLearn.map((match) => (
                <p key={`learn-${match.skill}`} className="rounded-lg bg-black/30 px-3 py-2">
                  Learn {match.skill}: you {match.yourLevel ?? "level not set"},
                  partner {match.theirLevel ?? "level not set"}
                </p>
              ))}
              {opponent.matchDetails.youTeach.map((match) => (
                <p key={`teach-${match.skill}`} className="rounded-lg bg-black/30 px-3 py-2">
                  Teach {match.skill}: you {match.yourLevel ?? "level not set"},
                  partner {match.theirLevel ?? "level not set"}
                </p>
              ))}
            </div>
          </div>
        )}

        {status === "matched" && (
          <button
            onClick={async () => {
              if (!client || !opponent?.roomId) return;
              // Ensure the meeting (call) is created in Stream
              const call = client.call("default", opponent.roomId);
              await call.getOrCreate();
              // Redirect to meeting page
              router.push(`/meeting/${opponent.roomId}`);
            }}
            className="mt-10 sm:mt-12 px-8 sm:px-10 py-3 sm:py-4 cursor-pointer rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg sm:text-xl shadow-lg transition-all hover:scale-105"
          >
            Start Session
          </button>
        )}
      </div>
    </div>
  );
}