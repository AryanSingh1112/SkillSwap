import { Images } from '@/constants'
import Link from 'next/link'
import React from 'react'
import Image from "next/image";

const ImageCard = ({ data }: { data: Images }) => {
  const { id, imageName, imagePath, data: innerData } = data

  return (
    <Link
      href={`/data/${id}`}
      className="block w-full max-w-md mx-auto p-4 rounded-2xl shadow-lg bg-[#1e293b] hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 mb-3">
        <h2 className="font-bold text-lg md:text-xl break-words text-white">
          {imageName}
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm md:text-base font-semibold px-3 py-1 rounded-full bg-green-600/80 text-white shadow-sm">
            Teach: <span className="font-normal">{innerData.teach}</span>
          </span>
          <span className="text-sm md:text-base font-semibold px-3 py-1 rounded-full bg-blue-600/80 text-white shadow-sm">
            Learn: <span className="font-normal">{innerData.skill}</span>
          </span>
        </div>
      </div>

      {/* Image / Video */}
      <div className="w-full overflow-hidden rounded-xl bg-gray-900">
        <Image
          src={imagePath}
          alt="resume"
          width={400}
          height={300}
          className="w-full h-auto object-contain rounded-xl transition-transform duration-300 hover:scale-105"
        />
      </div>
    </Link>
  )
}

export default ImageCard
