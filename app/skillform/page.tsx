"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { FaCheckCircle } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const levels = ["Easy", "Intermediate", "Advanced"];

export default function SkillFormPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [teachName, setTeachName] = useState("");
  const [teachLevel, setTeachLevel] = useState(levels[0]);
  const [learnName, setLearnName] = useState("");
  const [learnLevel, setLearnLevel] = useState(levels[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const updateSkills = useMutation(api.user.updateSkills);
  const email = user?.primaryEmailAddress?.emailAddress?.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teachName.trim() || !learnName.trim()) {
      setError("Please fill in all fields before submitting.");
      return;
    }

    if (!isLoaded || !isSignedIn || !email) {
      setError("Please sign in with an email address before saving your skills.");
      return;
    }

    const teach = teachName.trim();
    const learn = learnName.trim();
    setLoading(true);

    try {
      const saved = await updateSkills({
        email,
        teach: [teach],
        learn: [learn],
        teachLevels: [{ skill: teach, level: teachLevel }],
        learnLevels: [{ skill: learn, level: learnLevel }],
        userName: user.fullName || user.username || "",
        imageUrl: user.imageUrl || "",
      });

      const savedUser = saved.user;
      const teachWasSaved =
        savedUser?.teach?.includes(teach) &&
        savedUser.teachLevels?.some(
          (entry) => entry.skill === teach && entry.level === teachLevel,
        );
      const learnWasSaved =
        savedUser?.learn?.includes(learn) &&
        savedUser.learnLevels?.some(
          (entry) => entry.skill === learn && entry.level === learnLevel,
        );
      const teachTableRowSaved =
        typeof saved.skill?.teachSkill === "string" &&
        saved.skill.teachSkill.split(", ").includes(teach) &&
        typeof saved.skill.teachLevel === "string" &&
        saved.skill.teachLevel.split(", ").includes(teachLevel);
      const learnTableRowSaved =
        typeof saved.skill?.learnSkill === "string" &&
        saved.skill.learnSkill.split(", ").includes(learn) &&
        typeof saved.skill.learnLevel === "string" &&
        saved.skill.learnLevel.split(", ").includes(learnLevel);

      if (
        !teachWasSaved ||
        !learnWasSaved ||
        !teachTableRowSaved ||
        !learnTableRowSaved
      ) {
        throw new Error("The save could not be verified. Please try again.");
      }

      setSuccessOpen(true);
      window.setTimeout(
        () =>
          router.push(
            `/match?learn=${encodeURIComponent(learn)}&teach=${encodeURIComponent(teach)}`,
          ),
        1200,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error && saveError.message
          ? saveError.message
          : "Failed to save your skills. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[url('/images/bg-main1.png')] bg-cover bg-center">
      <div className="pointer-events-none absolute inset-0 animate-gradient-slow bg-gradient-to-br from-red-600 via-pink-500 to-purple-600 opacity-30"></div>
      <div className="relative z-10 flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
        <div className="flex flex-col items-center gap-3">
          <h1 className="!bg-none !text-center !text-5xl !font-extrabold !text-white !tracking-tight drop-shadow-[0_2px_15px_rgba(255,0,150,0.6)] sm:!text-6xl">
            Add a New Skill
          </h1>
          <p className="max-w-2xl text-center text-lg font-bold text-white">
            Enter the skill name and select your teach/learn level.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center gap-8 rounded-2xl bg-black/70 p-6 shadow-2xl backdrop-blur-md transition-all sm:p-10"
        >
          <div className="relative flex w-full flex-col items-center gap-4">
            <label htmlFor="teach-skill" className="text-lg font-extrabold text-white drop-shadow-lg">
              Skill to Teach
            </label>
            <input
              id="teach-skill"
              type="text"
              value={teachName}
              onChange={(e) => setTeachName(e.target.value)}
              placeholder="Enter skill to teach"
              maxLength={80}
              className="!w-3/4 !max-w-xl !rounded-xl !border !border-gray-700 !bg-gray-900 !px-6 !py-3 !text-lg !text-white !shadow-inner placeholder:!text-gray-400 outline-none transition focus:!ring-2 focus:!ring-red-500"
            />
            {teachName.trim() && (
              <FaCheckCircle aria-label="Skill entered" className="absolute right-[13%] top-11 text-green-400 sm:right-[13%] md:right-[14%] lg:right-[15%]" />
            )}
            <label htmlFor="teach-level" className="mt-4 text-lg font-extrabold text-white drop-shadow-lg">
              Level to Teach
            </label>
            <select
              id="teach-level"
              value={teachLevel}
              onChange={(e) => setTeachLevel(e.target.value)}
              className="w-3/4 max-w-xl rounded-xl border border-gray-700 bg-gray-900 px-6 py-3 text-lg text-white shadow-inner outline-none transition focus:ring-2 focus:ring-red-500"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex w-full flex-col items-center gap-4">
            <label htmlFor="learn-skill" className="text-lg font-extrabold text-white drop-shadow-lg">
              Skill to Learn
            </label>
            <input
              id="learn-skill"
              type="text"
              value={learnName}
              onChange={(e) => setLearnName(e.target.value)}
              placeholder="Enter skill to learn"
              maxLength={80}
              className="!w-3/4 !max-w-xl !rounded-xl !border !border-gray-700 !bg-gray-900 !px-6 !py-3 !text-lg !text-white !shadow-inner placeholder:!text-gray-400 outline-none transition focus:!ring-2 focus:!ring-red-500"
            />
            {learnName.trim() && (
              <FaCheckCircle aria-label="Skill entered" className="absolute right-[13%] top-11 text-green-400 sm:right-[13%] md:right-[14%] lg:right-[15%]" />
            )}
            <label htmlFor="learn-level" className="mt-4 text-lg font-extrabold text-white drop-shadow-lg">
              Level to Learn
            </label>
            <select
              id="learn-level"
              value={learnLevel}
              onChange={(e) => setLearnLevel(e.target.value)}
              className="w-3/4 max-w-xl rounded-xl border border-gray-700 bg-gray-900 px-6 py-3 text-lg text-white shadow-inner outline-none transition focus:ring-2 focus:ring-red-500"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p role="alert" aria-live="assertive" className="text-center font-medium text-red-300">
              {error}
            </p>
          )}

          <div className="flex w-full justify-center">
            <Button
              type="submit"
              className="w-3/4 max-w-xl cursor-pointer rounded-xl bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-red-600 hover:via-pink-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !isLoaded || !isSignedIn || !email}
            >
              {loading ? "Saving..." : "Add Skill"}
            </Button>
          </div>
        </form>
      </div>

      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent
          overlayClassName="!z-[60] !bg-slate-950/85 backdrop-blur-sm"
          className="!z-[70] !max-w-md !gap-0 !rounded-2xl !border !border-slate-700 !bg-slate-950 !p-6 !text-slate-100 !shadow-[0_24px_80px_rgba(0,0,0,0.75)] sm:!p-8"
        >
          <AlertDialogHeader className="!items-center !gap-3 !text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/15 text-emerald-300">
              <FaCheckCircle aria-hidden="true" className="size-7" />
            </div>
            <AlertDialogTitle className="!text-center !text-2xl !font-bold !text-white">
              Skills saved successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="!text-center !text-base !leading-6 !text-slate-300">
              Your skills are saved. Taking you to your matches...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!mt-6 !justify-center">
            <AlertDialogAction className="!min-w-28 !rounded-xl !bg-indigo-400 !px-6 !py-2.5 !font-semibold !text-slate-950 hover:!bg-indigo-300 focus-visible:!ring-2 focus-visible:!ring-indigo-200">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
