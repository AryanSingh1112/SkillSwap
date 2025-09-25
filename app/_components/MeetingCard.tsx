"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  participants?: { id: string; name?: string; image?: string }[];
  handleClick: () => void;
  link: string;
  buttonText?: string;
  buttonIcon1?: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  participants = [],
  handleClick,
  link,
  buttonText,
  buttonIcon1,
}: MeetingCardProps) => {
  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-5 py-8 xl:max-w-[568px]">
      <article className="flex flex-col gap-5">
        <Image src={icon} alt="meeting-icon" width={28} height={28} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h2
              className={cn(
                "font-bold",
                isPreviousMeeting ? "text-lg" : "text-2xl"
              )}
            >
              {title}
            </h2>
            <p className="text-base font-normal">{date}</p>
          </div>
        </div>
      </article>

      <article className="flex justify-between items-center mt-4">
        {/* ✅ Real participants */}
        <div className="flex relative">
          {participants.slice(0, 4).map((p, index) => (
            <Image
              key={p.id}
              src={
                p.image ||
                `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.id}`
              }
              alt={p.name || "attendee"}
              width={40}
              height={40}
              className={cn("rounded-full border-2 border-dark-2", {
                absolute: index > 0,
              })}
              style={{ left: index * 28 }}
            />
          ))}
          {participants.length > 4 && (
            <div className="flex-center absolute left-[120px] size-10 rounded-full border-[3px] border-dark-3 bg-dark-4 text-sm text-white">
              +{participants.length - 4}
            </div>
          )}
        </div>

        {/* ✅ Rejoin button for previous meetings */}
        {isPreviousMeeting && (
          <div className="flex gap-2">
            <Button onClick={handleClick} className="rounded bg-blue-1 px-6">
              Rejoin
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Copied to clipboard!");
              }}
              className="bg-dark-4 px-6"
            >
              <Image
                src="/icons/copy.svg"
                alt="copy-link"
                width={20}
                height={20}
              />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
        {/* ▶️ Play button for recordings */}
        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <Button onClick={handleClick} className="rounded bg-green-600 px-6 flex items-center">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="play" width={20} height={20} />
              )}
              &nbsp;{buttonText || "Play"}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Copied to clipboard!");
              }}
              className="bg-dark-4 px-6"
            >
              <Image
                src="/icons/copy.svg"
                alt="copy-link"
                width={20}
                height={20}
              />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
