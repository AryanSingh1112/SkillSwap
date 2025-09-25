// ...existing code...
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | 'meetingCreated' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useUser();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast.error('Please select a date and time');
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: { description },
        },
      });

      setCallDetail(call);

      if (!values.description) {
        router.push(`/meeting/${call.id}`);
        return;
      }

      // Show the success dialog
      setMeetingState('meetingCreated');

      // Auto-close after 2.5 seconds
      setTimeout(() => {
        setMeetingState(undefined);
      }, 5500);

    } catch (error) {
      console.error(error);
      toast.error('Failed to create Meeting');
    }
  };

  // Removed unused variable 'meetingLink'


  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {/* New Meeting */}
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        className="bg-orange-1"
        handleClick={() => setMeetingState('isInstantMeeting')}
      />

      {/* Join Meeting */}
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-blue-1"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />

      {/* Schedule Meeting */}


      {/* Recordings */}
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-yellow-1"
        handleClick={() => router.push('/recordings')}
      />

     

      {/* Meeting Created Dialog */}
      {meetingState === 'meetingCreated' && callDetail && (
        <MeetingModal
          isOpen
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            const link = `${window.location.origin}/meeting/${callDetail.id}`;
            navigator.clipboard.writeText(link);
            toast.success('Meeting link copied!');
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
        >
          <div className="mt-4 text-lg font-bold text-center text-white">
            Meeting Link: <span className="text-yellow-300">{`${window.location.origin}/meeting/${callDetail.id}`}</span>
          </div>
        </MeetingModal>
      )}

      {/* Join Meeting Dialog */}
      {meetingState === 'isJoiningMeeting' && (
        <MeetingModal
          isOpen
          onClose={() => setMeetingState(undefined)}
          title="Type the link here"
          className="text-center"
          buttonText="Join Meeting"
          handleClick={() => router.push(values.link)}
        >
          <Input
            placeholder="Meeting link"
            onChange={(e) => setValues({ ...values, link: e.target.value })}
            className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </MeetingModal>
      )}

      {/* Instant Meeting Dialog */}
      {meetingState === 'isInstantMeeting' && (
        <MeetingModal
          isOpen= {meetingState === 'isInstantMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Start an Instant Meeting"
          className="text-center"
          buttonText="Start Meeting"
          handleClick={createMeeting}
        />
      )}
    </section>
  );
};

export default MeetingTypeList;
