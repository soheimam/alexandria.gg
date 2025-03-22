"use client";

import { mockOnchainKitLesson } from "@/app/lib/mockLesson";
// import { AgentInputBar } from "@/components/AgentInputBar";

import { VoiceTranscript } from "@/components/voiceTranscript";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import { useEffect } from "react";

export const LessonPageContent = ({ lessonId }: { lessonId: string }) => {
  const { setLessonMeta, setLessonModules } = useAppStore();
  const transcript = useAppStore((s) => s.transcript);
  const { connect, send, isConnected } = useWebSocket(lessonId);

  useEffect(() => {
    // In the real app, you'll fetch lesson data by lessonId
    console.log("Loaded lessonId:", lessonId);
    connect();
    console.log("Connected to WebSocket");
    // Mock: always loads the same mock lesson
    setLessonMeta(mockOnchainKitLesson.meta);
    setLessonModules(mockOnchainKitLesson.modules);
  }, [lessonId]);

  return (
    <>
      
      <VoiceTranscript text={transcript || "Welcome to your course!"} />
      {/* <AgentInputBar onSubmit={(msg) => console.log("User sent:", msg)} /> */}
    </>
  );
};
