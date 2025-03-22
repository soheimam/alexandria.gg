"use client";

import { useEffect } from "react";
import { useAppStore } from "@/state/appStore";
import { mockOnchainKitLesson } from "@/app/lib/mockLesson";
import { LessonHeader } from "@/components/lessonHeader";
import { VoiceTranscript } from "@/components/voiceTranscript";
import { AgentInputBar } from "@/components/AgentInputBar";

export const LessonPageContent = ({ lessonId }: { lessonId: string }) => {
  const { setLessonMeta, setLessonModules } = useAppStore();
  const transcript = useAppStore((s) => s.transcript);

  useEffect(() => {
    // In the real app, you'll fetch lesson data by lessonId
    console.log("Loaded lessonId:", lessonId);

    // Mock: always loads the same mock lesson
    setLessonMeta(mockOnchainKitLesson.meta);
    setLessonModules(mockOnchainKitLesson.modules);
  }, [lessonId]);

  return (
    <>
      <LessonHeader meta={mockOnchainKitLesson.meta} />
      <VoiceTranscript text={transcript || "Welcome to your course!"} />
      <AgentInputBar onSubmit={(msg) => console.log("User sent:", msg)} />
    </>
  );
};
