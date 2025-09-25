"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Skill = { id: number; name: string; category: string; icon: string };
const skills: Skill[] = [
  { id: 1, name: "Guitar Playing", category: "Music", icon: "/icons/guitar.png" },
  { id: 2, name: "Singing", category: "Music", icon: "/icons/microphone.png" },
  { id: 3, name: "JavaScript", category: "Programming", icon: "/icons/programming.png" },
  { id: 4, name: "React", category: "Programming", icon: "/icons/code.png" },
  { id: 5, name: "UI/UX Design", category: "Design", icon: "/icons/web-design.png" },
  { id: 6, name: "Figma", category: "Design", icon: "/icons/figma.png" },
  { id: 7, name: "Spanish", category: "Languages", icon: "/icons/arabic.png" },
  { id: 8, name: "Marketing", category: "Business", icon: "/icons/music-app.png" },
  { id: 9, name: "Public Speaking", category: "Business", icon: "/icons/speaker.png" },
  { id: 10, name: "Cooking", category: "Other", icon: "/icons/cooking.png" },
  { id: 11, name: "Python", category: "Programming", icon: "/icons/programming.png" },
  { id: 12, name: "Trading", category: "Business", icon: "/icons/candlestick.png" },
  { id: 13, name: "Dancing", category: "Music", icon: "/icons/dance.png" },
  { id: 14, name: "AI Prompting", category: "Technology", icon: "/icons/ai.png" },
  { id: 15, name: "App Development", category: "Technology", icon: "/icons/music-app.png" },
  { id: 16, name: "Mathematics", category: "Technology", icon: "/icons/mathematic.png" },
];

const SkillsPage = () => {
  const [learnSkills, setLearnSkills] = useState<number[]>([]);
  const [teachSkills, setTeachSkills] = useState<number[]>([]);
  const [learnLevels, setLearnLevels] = useState<Record<number, string>>({});
  const [teachLevels, setTeachLevels] = useState<Record<number, string>>({});
  const levels = ["Easy", "Intermediate", "Advanced"];
  const router = useRouter();
  const { user } = useUser();
  const updateSkills = useMutation(api.user.updateSkills);
  const removeSkill = useMutation(api.user.removeSkill);
  const getUser = useQuery(api.user.getUser, user?.primaryEmailAddress?.emailAddress ? { email: user.primaryEmailAddress.emailAddress } : "skip");
  const [searchLearn, setSearchLearn] = useState("");
  const [searchTeach, setSearchTeach] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string; desc: string }>({
    title: "",
    desc: "",
  });

  useEffect(() => {
    if (getUser) {
      // Map skill names to IDs for highlighting
      const learnIds = skills.filter(s => getUser.learn?.includes(s.name)).map(s => s.id);
      const teachIds = skills.filter(s => getUser.teach?.includes(s.name)).map(s => s.id);
      setLearnSkills(learnIds);
      setTeachSkills(teachIds);
      // Set levels from DB for learn skills
      if (getUser.learnLevels) {
        const dbLearnLevels: Record<number, string> = {};
        getUser.learnLevels.forEach(({ skill, level }: { skill: string; level: string }) => {
          const skillObj = skills.find(s => s.name === skill);
          if (skillObj) dbLearnLevels[skillObj.id] = level;
        });
        setLearnLevels(dbLearnLevels);
      }
      // Set levels from DB for teach skills
      if (getUser.teachLevels) {
        const dbTeachLevels: Record<number, string> = {};
        getUser.teachLevels.forEach(({ skill, level }: { skill: string; level: string }) => {
          const skillObj = skills.find(s => s.name === skill);
          if (skillObj) dbTeachLevels[skillObj.id] = level;
        });
        setTeachLevels(dbTeachLevels);
      }
    }
  }, [getUser]);

  const filteredLearn = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchLearn.toLowerCase())
  );
  const filteredTeach = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTeach.toLowerCase())
  );

  const toggleLearn = (id: number) => {
    // Only add, don't remove highlight unless Remove button is clicked
    if (!learnSkills.includes(id)) {
      setLearnSkills((prev) => [...prev, id]);
      setLearnLevels((prev) => ({ ...prev, [id]: levels[0] }));
    }
  };
  const toggleTeach = (id: number) => {
    // Only add, don't remove highlight unless Remove button is clicked
    if (!teachSkills.includes(id)) {
      setTeachSkills((prev) => [...prev, id]);
      setTeachLevels((prev) => ({ ...prev, [id]: levels[0] }));
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-indigo-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
            What do you want to learn or teach?
          </h1>
          <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Select skills for both columns. Click a card to select or deselect. Use search to filter skills.
          </p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-22">
          {/* Learn Column */}
          <div className="flex flex-col gap-6 bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">What do you want to learn?</h2>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full shadow">
              <Search className="text-gray-400" />
              <input
                type="text"
                placeholder="Search skills to learn..."
                value={searchLearn}
                onChange={(e) => setSearchLearn(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {filteredLearn.map((skill) => {
                const selected = learnSkills.includes(skill.id);
                return (
                  <Card
                    key={skill.id}
                    onClick={() => toggleLearn(skill.id)}
                    className={`group cursor-pointer border-2 transition-all duration-300 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl ${selected
                        ? "border-indigo-500 ring-2 ring-indigo-300 bg-gradient-to-br from-indigo-100/80 to-fuchsia-100/80 dark:from-indigo-900/60 dark:to-fuchsia-900/60"
                        : "border-gray-200"
                      }`}
                  >
                    <CardContent className="flex flex-col items-center justify-center gap-4 p-7">
                      <Image src={skill.icon} alt={skill.name} width={64} height={64} className="w-16 h-16" />
                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 group-hover:text-indigo-600">
                        {skill.name}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-200">
                        {skill.category}
                      </span>
                      {selected && (
                        <div className="flex flex-col items-center gap-2 w-full">
                          <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/90 text-white shadow-md">
                            Selected
                          </span>
                          {/* Level dropdown for learn skill */}
                          <select
                            className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700"
                            value={learnLevels[skill.id]}
                            onChange={e => setLearnLevels(prev => ({ ...prev, [skill.id]: e.target.value }))}
                          >
                            {levels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                          <span className="text-xs mt-1 text-indigo-700">Level: {learnLevels[skill.id]}</span>
                          <Button
                            className="mt-2 px-3 py-1 text-xs rounded-full bg-red-500 text-white"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setLearnSkills((prev) => prev.filter((s) => s !== skill.id));
                              setLearnLevels((prev) => {
                                const copy = { ...prev };
                                delete copy[skill.id];
                                return copy;
                              });
                              if (user?.primaryEmailAddress?.emailAddress) {
                                await removeSkill({
                                  email: user.primaryEmailAddress.emailAddress,
                                  skill: skill.name,
                                  type: "learn",
                                });
                              }
                            }}
                          >
                            Remove Skill
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Teach Column */}
          <div className="flex flex-col gap-6 bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-fuchsia-600 mb-2">What can you teach?</h2>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full shadow">
              <Search className="text-gray-400" />
              <input
                type="text"
                placeholder="Search skills to teach..."
                value={searchTeach}
                onChange={(e) => setSearchTeach(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {filteredTeach.map((skill) => {
                const selected = teachSkills.includes(skill.id);
                return (
                  <Card
                    key={skill.id}
                    onClick={() => toggleTeach(skill.id)}
                    className={`group cursor-pointer border-2 transition-all duration-300 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl ${selected
                        ? "border-fuchsia-500 ring-2 ring-fuchsia-300 bg-gradient-to-br from-fuchsia-100/80 to-indigo-100/80 dark:from-fuchsia-900/60 dark:to-indigo-900/60"
                        : "border-gray-200"
                      }`}
                  >
                    <CardContent className="flex flex-col items-center justify-center gap-4 p-7">
                      <Image src={skill.icon} alt={skill.name} width={64} height={64} className="w-16 h-16" />
                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 group-hover:text-fuchsia-600">
                        {skill.name}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-100/80 text-fuchsia-700 dark:bg-fuchsia-900/80 dark:text-fuchsia-200">
                        {skill.category}
                      </span>
                      {selected && (
                        <div className="flex flex-col items-center gap-2 w-full">
                          <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-500/90 text-white shadow-md">
                            Selected
                          </span>
                          {/* Level dropdown for teach skill */}
                          <select
                            className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-100 text-fuchsia-700"
                            value={teachLevels[skill.id]}
                            onChange={e => setTeachLevels(prev => ({ ...prev, [skill.id]: e.target.value }))}
                          >
                            {levels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                          <span className="text-xs mt-1 text-fuchsia-700">Level: {teachLevels[skill.id]}</span>
                          <Button
                            className="mt-2 px-3 py-1 cursor-pointer text-xs rounded-full bg-red-500 text-white"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setTeachSkills((prev) => prev.filter((s) => s !== skill.id));
                              setTeachLevels((prev) => {
                                const copy = { ...prev };
                                delete copy[skill.id];
                                return copy;
                              });
                              if (user?.primaryEmailAddress?.emailAddress) {
                                await removeSkill({
                                  email: user.primaryEmailAddress.emailAddress,
                                  skill: skill.name,
                                  type: "teach",
                                });
                              }
                            }}
                          >
                            Remove Skill
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <Button
            className="px-50 py-8 text-2xl cursor-pointer rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-fuchsia-600"
            onClick={async () => {
              if (!user?.primaryEmailAddress?.emailAddress) {
                setAlertMessage({
                  title: "Not signed in",
                  desc: "You must be logged in to save skills.",
                });
                setAlertOpen(true);
                return;
              }
              if (learnSkills.length === 0 || teachSkills.length === 0) {
                setAlertMessage({
                  title: "Selection required",
                  desc: "Please select at least one skill to learn and one to teach.",
                });
                setAlertOpen(true);
                return;
              }

              const learnNames = learnSkills
                .map((id) => skills.find((s) => s.id === id)?.name)
                .filter((n): n is string => Boolean(n));
              const teachNames = teachSkills
                .map((id) => skills.find((s) => s.id === id)?.name)
                .filter((n): n is string => Boolean(n));

              // Build levels arrays for backend
              const learnLevelsArr = learnSkills
                .map((id) => {
                  const skillName = skills.find((s) => s.id === id)?.name;
                  const level = learnLevels[id];
                  if (skillName && level) return { skill: skillName, level };
                  return null;
                })
                .filter((item): item is { skill: string; level: string } => Boolean(item));
              const teachLevelsArr = teachSkills
                .map((id) => {
                  const skillName = skills.find((s) => s.id === id)?.name;
                  const level = teachLevels[id];
                  if (skillName && level) return { skill: skillName, level };
                  return null;
                })
                .filter((item): item is { skill: string; level: string } => Boolean(item));

              try {
                await updateSkills({
                  email: user.primaryEmailAddress.emailAddress,
                  learn: learnNames,
                  teach: teachNames,
                  learnLevels: learnLevelsArr,
                  teachLevels: teachLevelsArr,
                  userName: user.fullName || user.username || "",
                  imageUrl: user.imageUrl || "",
                });
                setAlertMessage({
                  title: "Skills saved 🎉",
                  desc: "Your learn and teach skills were updated successfully.",
                });
                setAlertOpen(true);
              } catch (e) {
                setAlertMessage({
                  title: "Error saving skills",
                  desc: "Something went wrong. Please try again.",
                });
                setAlertOpen(true);
              }
            }}
          >
            Save Skills
          </Button>
        </div>
      </div>

      {/* Beautiful AlertDialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-indigo-100 via-white to-fuchsia-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-8 max-w-md mx-auto animate-fade-in">
          <AlertDialogHeader className="flex flex-col items-center gap-2">
            {/* Icon for visual appeal */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 text-white shadow-lg mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3.08l-6.928-12c-.77-1.333-2.694-1.333-3.464 0l-6.928 12c-.77 1.413.192 3.08 1.732 3.08z" />
              </svg>
            </div>
            <AlertDialogTitle className="text-2xl font-extrabold text-indigo-700 dark:text-fuchsia-400 text-center drop-shadow-sm">
              {alertMessage.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-700 dark:text-gray-200 text-center mt-2">
              {alertMessage.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center mt-6 space-x-4">
            <AlertDialogAction
              onClick={() => {
                router.push('/match');
                setAlertOpen(false);
              }}
              className="px-8 py-3 cursor-pointer rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-fuchsia-600 transition-all text-lg"
            >
              Find Your Match
            </AlertDialogAction>

            <AlertDialogAction
              onClick={() => setAlertOpen(false)}
              className="px-8 py-3 cursor-pointer rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-fuchsia-600 transition-all text-lg"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default SkillsPage;
