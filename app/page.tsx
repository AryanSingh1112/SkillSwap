"use client";

import { datas } from "@/constants";
import NavBar from "./_components/NavBar";
import ImageCard from "./_components/ImageCard";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { FaGithub } from "react-icons/fa";

export default function Home() {
  const { user } = useUser();
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    const CheckUser = async () => {
      const result = await createUser({
        email: user?.primaryEmailAddress?.emailAddress || "",
        imageUrl: user?.imageUrl || "",
        userName: user?.fullName || user?.username || "Anonymous",
      });
      console.log(result);
    };
    if (user) CheckUser();
  }, [user]);

  return (
    <main className="bg-[url('/images/bg-main1.png')] bg-cover bg-center min-h-screen flex flex-col">
      <div className="flex-1">
        <NavBar />

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-32 px-6">
          <h1 className=" font-extrabold text-white drop-shadow-xl leading-tight">
            Match Skills, Meet People, <br /> and Learn Together
          </h1>
          <p className="mt-6 text-lg md:text-2xl text-gray-200 max-w-2xl">
            Grow your expertise through connections.
          </p>

          {/* GitHub Button */}
          <div className="mt-16">
            <a
              href="https://github.com/AryanSingh1112"
              target="_blank"
              className="inline-flex items-center gap-4 px-6 py-3 bg-purple-800 hover:bg-purple-600 text-white font-semibold rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              <FaGithub className="w-5 h-5" />
              Visit GitHub
            </a>
          </div>
        </section>

        {/* Unified Section for Image Cards */}
        {datas.length > 0 && (
          <section className="py-16 bg-black/70 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
              Explore Skills & Make Connections
            </h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12">
              Discover new skills, meet experts, and join interactive sessions to grow together.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
              {datas.map((data) => (
                <ImageCard key={data.id} data={data} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
