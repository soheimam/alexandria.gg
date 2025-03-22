// /app/lesson/page.tsx
"use client";


import { VoiceTranscript } from "@/components/voiceTranscript";
import { AgentInputBar } from "@/components/AgentInputBar";

import { Card, CardContent } from "@/components/ui/card";

export default function LessonOverview() {
  return (
    <main className=" bg-[#f0e6f5] p-4 md:p-8 flex flex-col items-center justify-center">
      
     

            <VoiceTranscript text="Welcome! Let's learn OnchainKit together." />
            <AgentInputBar onSubmit={(msg) => console.log("User sent:", msg)} />
      
      
    </main>
  );
}
