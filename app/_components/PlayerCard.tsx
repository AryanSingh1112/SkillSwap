import { PlayerCardProps } from "@/lib/types";
// import Image from "next/image";

interface ExtendedPlayerCardProps extends PlayerCardProps {
  variant?: "self" | "opponent";
}

export function PlayerCard({
  avatar,
  name,
  teach,
  learn,
  isWaiting,
  variant = "self",
}: ExtendedPlayerCardProps) {
  const isSelf = variant === "self";

  return (
    <div className="flex flex-col items-center gap-6 animate-fadeIn">
      <div className="relative flex flex-col items-center">
        {/* Avatar */}
        {isWaiting ? (
          <div className="w-64 sm:w-72 md:w-80 aspect-square rounded-full border-4 border-gray-700 flex items-center justify-center text-6xl text-gray-500 bg-zinc-800">
            ?
          </div>
        ) : (
          <img
            src={avatar || "/images/default-avatar.png"}
            alt={name || "Avatar"}
            className={`w-64 sm:w-72 md:w-80 aspect-square rounded-full border-4 object-cover
              ${
                isSelf
                  ? "border-red-600 shadow-[0_0_25px_rgba(239,68,68,0.6)]"
                  : "border-blue-600 shadow-[0_0_25px_rgba(59,130,246,0.6)]"
              }`}
          />
        )}

        {/* Info */}
        <div className="text-center mt-6">
          <h2
            className={`text-3xl sm:text-4xl font-extrabold uppercase ${
              isSelf ? "text-red-400" : "text-blue-400"
            }`}
          >
            {isWaiting ? "Waiting..." : name}
          </h2>
          <p className="text-xl mt-3 text-gray-300">
            <span className="font-semibold text-fuchsia-400">Teach:</span>{" "}
            {isWaiting ? "--" : teach}
          </p>
          <p className="text-xl text-gray-300">
            <span className="font-semibold text-indigo-400">Learn:</span>{" "}
            {isWaiting ? "--" : learn}
          </p>
        </div>
      </div>
    </div>
  );
}
