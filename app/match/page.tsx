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
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-400 drop-shadow-lg animate-fadeIn text-center">
        Match Found
      </h1>
    </div>
  );
}

type Opponent = {
  userName?: string;
  teach?: string[];
  learn?: string[];
  _id?: string;
  roomId?: string;
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

  // ⏳ Keep retrying until a match is found
  useEffect(() => {
    if (!email) return;

    setStatus("waiting");
    setNoMatch(false);

    let elapsed = 0;
    const interval = setInterval(() => {
      if (noMatch) {
        clearInterval(interval);
        return;
      }
      findMatch({ email }).then((result: Opponent | null) => {
        if (result) {
          setOpponent(result);
          setStatus("matched");
          clearInterval(interval); // ✅ stop searching when match found
        }
      });
      elapsed += 4;
      if (elapsed >= 12) {
        // 12 seconds timeout
        setNoMatch(true);
        clearInterval(interval);
      }
    }, 4000); // check every 4 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, findMatch]);

  // ✅ only matched skills
  const matched = useMemo(() => {
    if (!selfData || !opponent) {
      return { selfTeach: [], selfLearn: [], oppTeach: [], oppLearn: [] };
    }

    return {
      selfTeach: (selfData.teach ?? []).filter((s: string) =>
        (opponent.learn ?? []).includes(s)
      ),
      selfLearn: (selfData.learn ?? []).filter((s: string) =>
        (opponent.teach ?? []).includes(s)
      ),
      oppTeach: (opponent.teach ?? []).filter((s: string) =>
        (selfData.learn ?? []).includes(s)
      ),
      oppLearn: (opponent.learn ?? []).filter((s: string) =>
        (selfData.teach ?? []).includes(s)
      ),
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
                Try updating your skills or levels to find a match.
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
