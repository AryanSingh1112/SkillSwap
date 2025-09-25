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
  <div className="flex h-screen w-full flex-col items-center justify-center gap-6 text-white bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
  <h1 className="text-center text-3xl font-extrabold mb-2 tracking-tight">Meeting Setup</h1>
      <div className="flex items-center justify-center w-full">
        <VideoPreview />
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <label className="flex items-center gap-3 font-medium cursor-pointer">
          <span className="relative inline-block w-7 h-7">
            <input
              type="checkbox"
              checked={isMicCamToggled}
              onChange={(e) => setIsMicCamToggled(e.target.checked)}
              className="peer appearance-none w-7 h-7 border-2 border-green-400 rounded-md bg-transparent transition-colors duration-150 focus:outline-none"
            />
            <svg
              className="absolute left-0 top-0 w-7 h-7 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
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
          <span className="text-base md:text-lg lg:text-xl">Join with mic and camera off</span>
        </label>
        <DeviceSettings />
      </div>

      <Button
        className="rounded-full bg-gradient-to-r from-green-400 to-green-600 px-8 py-3 text-lg font-bold shadow-lg hover:scale-105 transition-transform duration-150"
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
  )
}

export default MeetingSetup