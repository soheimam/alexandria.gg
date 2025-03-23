"use client";

import { VoiceTranscript } from "@/components/voiceTranscript";
import { useLessonContent } from "@/hooks/useLessonContent";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { FlashCardModal } from "./FlashCards/FlashCardModal";

export const LessonPageContent = ({ lessonId }: { lessonId: string }) => {
  const { flashCardsOpen, toggleFlashCardsModal } = useAppStore();
  const { address } = useAccount();
  const { connect, spokenText, isSpeaking } = useWebSocket(address as `0x${string}`, lessonId);
  const [firstSpeak, setFirstSpeak] = useState(false);
  const { content, refresh } = useLessonContent(address as `0x${string}`, lessonId);

  console.log("LessonPageContent rendering with spokenText:", spokenText);

  useEffect(() => {
    // In the real app, you'll fetch lesson data by lessonId
    console.log("Loaded lessonId:", lessonId);
    connect();
    console.log("Connected to WebSocket");
  }, [lessonId, connect]);

  useEffect(() => {
    if (spokenText && !firstSpeak) {
      console.log("Refreshing lesson content");
      refresh();
      setFirstSpeak(true);
    }
  }, [spokenText, firstSpeak, refresh]);

  return (
    <div className="flex flex-col space-y-4 w-full max-w-2xl mx-auto p-4">
   
      <VoiceTranscript
        text={spokenText}
        isSpeaking={isSpeaking}
      // key={spokenText} // Force re-render when text changes
      />
      <FlashCardModal isOpen={flashCardsOpen} onClose={() => { toggleFlashCardsModal() }} cards={content?.content.flash_cards ?? []} />
      {/* <AgentBar spokenText={spokenText} /> */}
    </div>
  );
};
