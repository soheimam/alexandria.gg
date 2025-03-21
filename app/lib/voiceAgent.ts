import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
});

export async function playVoiceAgentMessage(text: string) {
  const voiceId = "YOUR_VOICE_ID";

  const stream = await client.generate({
    voice: voiceId,
    text: text,
    model_id: "eleven_monolingual_v1",
    stream: true,
  });

  const blob = await streamToBlob(stream);
  const audioUrl = URL.createObjectURL(blob);

  const audio = new Audio(audioUrl);
  await audio.play();
}

// ✅ Convert a Node.js Readable stream to a browser Blob
async function streamToBlob(stream: any): Promise<Blob> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return new Blob(chunks, { type: "audio/mpeg" });
}
