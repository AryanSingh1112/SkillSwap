import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface MeetingCardProps {
  icon: string;
  title: string;
  date: string;
  isPreviousMeeting: boolean;
  link: string;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  buttonText,
  handleClick,
}: MeetingCardProps) => (
  <article className="flex min-h-[220px] flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-white shadow-xl">
    <div className="flex flex-col gap-4">
      <div className="flex size-12 items-center justify-center rounded-xl bg-white/10">
        <Image src={icon} alt="" width={24} height={24} />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="break-words text-xl font-bold">{title}</h2>
        <p className="text-sm text-white/70">{date}</p>
      </div>
    </div>

    <Button
      type="button"
      onClick={handleClick}
      className="w-fit gap-2 bg-blue-600 text-white hover:bg-blue-700"
    >
      {!isPreviousMeeting && buttonIcon1 && (
        <Image src={buttonIcon1} alt="" width={18} height={18} />
      )}
      {buttonText || (isPreviousMeeting ? 'View meeting' : 'Open recording')}
    </Button>
  </article>
);

export default MeetingCard;
