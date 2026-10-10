import { Images } from "@/constants";
import Link from "next/link";
import React from "react";
import Image from "next/image";

const ImageCard = ({ data }: { data: Images }) => {
  const { id, imageName, imagePath, data: innerData } = data;

  return (
    <Link
      href={`/data/${id}`}
      className="group flex h-full w-full flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        {/* !text-white overrides the global h2 color */}
        <h2 className="!text-white text-xl font-bold tracking-tight break-words md:text-2xl">
          {imageName}
        </h2>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm">
            Teach: <span className="font-normal">{innerData.teach}</span>
          </span>
          <span className="rounded-full bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm">
            Learn: <span className="font-normal">{innerData.skill}</span>
          </span>
        </div>
      </div>

      {/* Image / Video */}
      {/* Image / Video */}
<div className="mt-auto w-full overflow-hidden rounded-2xl bg-gray-900">
  <Image
    src={imagePath}
    alt={imageName}
    width={400}
    height={300}
    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
    className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
  />
</div>
    </Link>
  );
};

export default ImageCard;