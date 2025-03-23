"use client";

import { VoiceTranscript } from "@/components/voiceTranscript";
import { useLessonContent } from "@/hooks/useLessonContent";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { FlashCardModal } from "./FlashCards/FlashCardModal";

export const LessonPageContent = ({ lessonId }: { lessonId: string }) => {
  const { flashCardsOpen, toggleFlashCardsModal } = useAppStore();
  const { address } = useAccount();
  const { connect, spokenText, isSpeaking } = useWebSocket(address as `0x${string}`, lessonId);
  const [firstSpeak, setFirstSpeak] = useState(false);
  const { content, refresh } = useLessonContent(address as `0x${string}`, lessonId);
  const [isLoading, setIsLoading] = useState(true);
  const [lottieData, setLottieData] = useState(null);

  useEffect(() => {
    // Load the Lottie animation file
    fetch('/book-lottee.json')
      .then(response => response.json())
      .then(data => setLottieData(data))
      .catch(error => console.error('Error loading Lottie animation:', error));
  }, []);

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
      setIsLoading(false);
    }
  }, [spokenText, firstSpeak, refresh]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="w-64 h-64 mb-6">
          {lottieData && (
            <Lottie
              animationData={lottieData}
              loop={true}
              autoplay={true}
            />
          )}
        </div>
        <div className="flex flex-col items-center space-y-2">
          <p className="text-lg text-center text-purple-800 font-medium">
            Preparing your lesson...
          </p>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    );
  }

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
