"use client";

import MeetingRoom from "@/app/_components/MeetingRoom";
import MeetingSetup from "@/app/_components/MeetingSetup";
import { useGetCallById } from "@/hooks/useGetCallById";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import React, { useState, use } from "react"; // ✅ import `use`

const MeetingId = ({ params }: { params: Promise<{ meetingId: string }> }) => {
  // ✅ unwrap the promise
  const { meetingId } = use(params);

  // const { isLoaded, user } = useUser();
  const { call, isCallLoading } = useGetCallById(meetingId);

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (isCallLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white">
        Loading call...
      </div>
    );
  }

  if (!call) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-red-500">
        Call not found
      </div>
    );
  }

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup call={call} setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom call={call} />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingId;
