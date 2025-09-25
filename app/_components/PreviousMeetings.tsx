'use client';

import { Call, CallRecording } from '@stream-io/video-react-sdk';
import Loader from './Loader';
import MeetingCard from './MeetingCard';
import { useGetCalls } from '@/hooks/useGetCalls';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MeetingListProps {
  type: 'ended' | 'recordings';
}

const MeetingList = ({ type }: MeetingListProps) => {
  const router = useRouter();
  const { endedCalls, callRecordings, isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      if (type !== 'recordings' || !callRecordings) return;

      const callData = await Promise.all(
        callRecordings.map((meeting) => meeting.queryRecordings())
      );

      const allRecordings = callData
        .filter((c) => c.recordings.length > 0)
        .flatMap((c) => c.recordings);

      setRecordings(allRecordings);
    };

    fetchRecordings();
  }, [type, callRecordings]);

  if (isLoading) return <Loader />;

  if (type === 'recordings' && recordings.length === 0) {
    return <h1 className="text-2xl font-bold text-white">No Recordings</h1>;
  }

  if (type === 'ended' && (!endedCalls || endedCalls.length === 0)) {
    return <h1 className="text-2xl font-bold text-white">No Previous Calls</h1>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {type === 'ended' && Array.isArray(endedCalls) &&
        endedCalls.map((meeting: Call) => (
          <MeetingCard
            key={`ended-${meeting.id}`} // make key unique
            icon="/icons/previous.svg"
            title={meeting.state?.custom?.description || 'No Description'}
            date={meeting.state?.startsAt?.toLocaleString() || ''}
            isPreviousMeeting={true}
            link={`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meeting.id}`}
            handleClick={() => router.push(`/meeting/${meeting.id}`)}
          />
        ))}

      {type === 'recordings' &&
        recordings.map((rec: CallRecording, index) => (
          <MeetingCard
            key={`recording-${rec.filename || index}`}
            icon="/icons/recordings.svg"
            title={rec.filename?.substring(0, 20) || 'No Description'}
            date={rec.start_time?.toLocaleString() || ''}
            isPreviousMeeting={false}
            link={rec.url}
            buttonIcon1="/icons/play.svg"
            buttonText="Play"
            handleClick={() => router.push(rec.url)}
          />
        ))}
    </div>
  );
};

export default MeetingList;
