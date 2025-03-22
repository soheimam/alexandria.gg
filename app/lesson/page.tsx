// /app/lesson/page.tsx
"use client";

import { LessonHeader } from "@/components/lessonHeader";
import { VoiceTranscript } from "@/components/voiceTranscript";
import { AgentInputBar } from "@/components/AgentInputBar";
import { mockOnchainKitLesson } from "@/app/lib/mockLesson";

export default function LessonOverview() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-between p-6 space-y-6">
      <LessonHeader meta={mockOnchainKitLesson.meta} />
      <VoiceTranscript text="Welcome! Let's learn OnchainKit together." />
      <AgentInputBar onSubmit={(msg) => console.log("User sent:", msg)} />
    </main>
  );
}
