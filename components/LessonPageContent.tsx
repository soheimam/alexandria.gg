"use client";

import { mockOnchainKitLesson } from "@/app/lib/mockLesson";
// import { AgentInputBar } from "@/components/AgentInputBar";

import { VoiceTranscript } from "@/components/voiceTranscript";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import { useEffect, useState } from "react";

export const LessonPageContent = ({ lessonId }: { lessonId: string }) => {
  const { setLessonMeta, setLessonModules } = useAppStore();
  const { connect, spokenText, isSpeaking } = useWebSocket(lessonId);
  const [displayText, setDisplayText] = useState("");
  const [displaySpeaking, setDisplaySpeaking] = useState(false);

  console.log("LessonPageContent rendering with spokenText:", spokenText);

  useEffect(() => {
    // In the real app, you'll fetch lesson data by lessonId
    console.log("Loaded lessonId:", lessonId);
    connect();
    console.log("Connected to WebSocket");
    setLessonMeta(mockOnchainKitLesson.meta);
    setLessonModules(mockOnchainKitLesson.modules);
  }, [lessonId, connect, setLessonMeta, setLessonModules]);

  // Update the display text when spokenText changes
  useEffect(() => {
    console.log("spokenText changed in LessonPageContent:", spokenText);
    if (spokenText) {
      console.log("Setting display text to:", spokenText);
      setDisplayText(spokenText);
      setDisplaySpeaking(isSpeaking);
    }
  }, [spokenText, isSpeaking]);

  return (
    <div className="flex flex-col space-y-4 w-full max-w-2xl mx-auto p-4">
      <VoiceTranscript
        text={displayText}
        isSpeaking={displaySpeaking}
        key={displayText} // Force re-render when text changes
      />
      {/* <FlashCardModal isOpen={true} onClose={() => { }} cards={[]} /> */}
      {/* <AgentBar spokenText={spokenText} /> */}
    </div>
  );
};
