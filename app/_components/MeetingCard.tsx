'use client';
import { useState } from 'react';
import { Call } from '@stream-io/video-react-sdk';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, Check } from 'lucide-react';

import Loader from './Loader';

import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EndCallButton from './EndCallButton';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const layoutOptions: { value: CallLayoutType; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'speaker-left', label: 'Speaker left' },
  { value: 'speaker-right', label: 'Speaker right' },
];

/* One style for every round control button so the bar looks consistent */
const controlButton =
  'relative flex cursor-pointer items-center justify-center rounded-2xl bg-[#19232d] px-4 py-2 text-white transition-colors hover:bg-[#4c535b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

const MeetingRoom = ({ call }: { call: Call }) => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  if (callingState !== CallingState.JOINED) return <Loader />;

  // A plain function (not a component), so the video does not remount on every state change
  const renderLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="fixed inset-0 z-40 h-screen w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-4 text-white">
      {/* Video area: bottom padding keeps the controls from covering the video */}
      <div className="relative flex size-full items-center justify-center gap-3 px-4 pb-28">
        <div className="flex size-full max-w-[1200px] items-center">{renderLayout()}</div>

        {/* Participants panel */}
        <div
          className={cn(
            'absolute bottom-28 right-4 top-4 z-50 w-[300px] max-w-[calc(100vw-2rem)] lg:static lg:h-[calc(100vh-140px)] lg:w-[300px]',
            showParticipants ? 'block' : 'hidden'
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Call controls */}
      <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-fit -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#18181b]/85 px-4 py-3 shadow-2xl backdrop-blur">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <DropdownMenuTrigger
            className={controlButton}
            aria-label="Change layout"
            title="Change layout"
          >
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-dark-1 text-white">
            {layoutOptions.map((item, index) => (
              <div key={item.value}>
                <DropdownMenuItem
                  onClick={() => setLayout(item.value)}
                  className="cursor-pointer justify-between gap-6 text-white focus:bg-white/10 focus:text-white"
                >
                  {item.label}
                  {layout === item.value && <Check size={16} className="text-green-400" />}
                </DropdownMenuItem>
                {index < layoutOptions.length - 1 && (
                  <DropdownMenuSeparator className="bg-white/10" />
                )}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        <button
          type="button"
          onClick={() => setShowParticipants((prev) => !prev)}
          className={cn(controlButton, showParticipants && 'bg-[#4c535b]')}
          aria-label="Show participants"
          aria-pressed={showParticipants}
          title="Participants"
        >
          <Users size={20} className="text-white" />
          <span className="ml-2 text-sm font-semibold text-white">{participantCount}</span>
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;