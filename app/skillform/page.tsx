"use client";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaCheckCircle } from "react-icons/fa";

const levels = ["Easy", "Intermediate", "Advanced"];

export default function SkillFormPage() {
  const { user } = useUser();
  const [teachName, setTeachName] = useState("");
  const [teachLevel, setTeachLevel] = useState(levels[0]);
  const [learnName, setLearnName] = useState("");
  const [learnLevel, setLearnLevel] = useState(levels[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateSkills = useMutation(api.user.updateSkills);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teachName.trim() || !learnName.trim()) {
      setError("Please fill in all fields before submitting.");
      return;
    }

    setLoading(true);

    try {
      await updateSkills({
        email: user?.primaryEmailAddress?.emailAddress || "",
        teach: [teachName],
        learn: [learnName],
        teachLevels: [{ skill: teachName, level: teachLevel }],
        learnLevels: [{ skill: learnName, level: learnLevel }],
        userName: user?.fullName || user?.username || "",
        imageUrl: user?.imageUrl || "",
      });

      router.push("/match");
    } catch {
      setError("Failed to add skill. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[url('/images/bg-main1.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-pink-500 to-purple-600 opacity-30 animate-gradient-slow pointer-events-none"></div>
      <div className="relative max-w-4xl w-full flex flex-col gap-10 z-10 px-6 py-12">

        <div className="flex flex-col items-center gap-3">
         <h1 className="text-5xl sm:text-6xl font-extrabold text-center bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,0,150,0.6)] tracking-tight">
  Add a New Skill
</h1>

          <p className="text-center text-lg font-bold text-gray-100 max-w-2xl">
            Enter the skill name and select your teach/learn level.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8 bg-black/70 rounded-2xl p-10 shadow-2xl backdrop-blur-md transition-all w-full">
          
          <div className="w-full flex flex-col items-center gap-4 relative">
            <label className="font-extrabold text-lg bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
              Skill to Teach
            </label>
            <input
              type="text"
              value={teachName}
              onChange={(e) => setTeachName(e.target.value)}
              placeholder="Enter skill to teach"
              className="w-3/4 max-w-xl px-6 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white text-lg shadow-inner focus:ring-2 focus:ring-red-500 outline-none transition"
            />
            {teachName.trim() && <FaCheckCircle className="absolute right-[25%] top-11 text-green-400" />}
            <label className="font-extrabold text-lg bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg mt-4">
              Level to Teach
            </label>
            <select
              value={teachLevel}
              onChange={(e) => setTeachLevel(e.target.value)}
              className="w-3/4 max-w-xl px-6 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white text-lg shadow-inner focus:ring-2 focus:ring-red-500 outline-none transition"
            >
              {levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="w-full flex flex-col items-center gap-4 relative">
            <label className="font-extrabold text-lg bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
              Skill to Learn
            </label>
            <input
              type="text"
              value={learnName}
              onChange={(e) => setLearnName(e.target.value)}
              placeholder="Enter skill to learn"
              className="w-3/4 max-w-xl px-6 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white text-lg shadow-inner focus:ring-2 focus:ring-red-500 outline-none transition"
            />
            {learnName.trim() && <FaCheckCircle className="absolute right-[25%] top-11 text-green-400" />}
            <label className="font-extrabold text-lg bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg mt-4">
              Level to Learn
            </label>
            <select
              value={learnLevel}
              onChange={(e) => setLearnLevel(e.target.value)}
              className="w-3/4 max-w-xl px-6 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white text-lg shadow-inner focus:ring-2 focus:ring-red-500 outline-none transition"
            >
              {levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-400 text-center font-medium">{error}</p>}


          <div className="w-full justify-center flex">
          <Button
            type="submit"
            className="bg-gradient-to-r cursor-pointer from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white py-3 rounded-xl font-bold text-lg w-3/4 max-w-xl shadow-lg transform transition-all hover:scale-105"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Skill"}
          </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
