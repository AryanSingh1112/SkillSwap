import { Button } from '@/components/ui/button';
import { DeviceSettings, VideoPreview, Call } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'

const MeetingSetup = ({
  setIsSetupComplete,
  call,
}: {
  setIsSetupComplete: (value: boolean) => void;
  call: Call;
}) => {
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  useEffect(() => {
    if (isMicCamToggled) {
      call?.camera.disable();
      call?.microphone.disable();
    } else {
      call?.camera.enable();
      call?.microphone.enable();
    }
  }, [isMicCamToggled, call?.camera, call?.microphone]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8 text-white">
      <div className="flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-10">

        {/* Header: !bg-none !text-white overrides the global h1 gradient */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="!bg-none !text-3xl font-extrabold !leading-tight !tracking-tight !text-white md:!text-4xl">
            Meeting Setup
          </h1>
          <p className="text-base text-white md:text-lg">
            Check your camera and microphone before you join.
          </p>
        </div>

        {/* Video preview */}
        <div className="flex w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black">
          <VideoPreview />
        </div>

        {/* Options */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row">
          {/* !classes on the checkbox and label override the global input/label rules */}
          <label className="flex cursor-pointer items-center gap-3 font-medium !text-white">
            <span className="relative inline-block h-7 w-7 shrink-0">
              <input
                type="checkbox"
                checked={isMicCamToggled}
                onChange={(e) => setIsMicCamToggled(e.target.checked)}
                className="peer !h-7 !w-7 appearance-none !rounded-md border-2 border-green-400 !bg-transparent !p-0 !shadow-none transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60"
              />
              <svg
                className="pointer-events-none absolute left-0 top-0 h-7 w-7 opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 10 18 4 12" stroke="#22c55e" />
              </svg>
            </span>
            <span className="text-base md:text-lg">Join with mic and camera off</span>
          </label>

          <DeviceSettings />
        </div>

        {/* Join */}
        <Button
          className="w-full cursor-pointer rounded-full bg-gradient-to-r from-green-400 to-green-600 px-8 py-6 text-lg font-bold text-white shadow-lg transition-transform duration-150 hover:scale-[1.02]"
          onClick={() => {
            call.join();
            setIsSetupComplete(true);
          }}
        >
          <span className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
              <polyline points="20 6 10 18 4 12" />
            </svg>
            Join Meeting
          </span>
        </Button>
      </div>
    </div>
  )
}

export default MeetingSetup