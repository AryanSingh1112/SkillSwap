import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { tokenProvider } from "@/actions/stream.actions";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export async function createStreamMeeting(userId: string) {
  if (!API_KEY) throw new Error("Stream API key is missing");

  const client = new StreamVideoClient({
    apiKey: API_KEY,
    user: { id: userId },
    tokenProvider,
  });

  const meetingId = `meeting_${Math.random().toString(36).substring(2, 9)}`;
  const call = client.call("default", meetingId);

  // ensure call is created before join
  await call.create({});

  return call.id;
}
