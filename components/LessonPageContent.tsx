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
      {content && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-xl font-bold text-purple-900">{content.content.topic || "Your Lesson"}</h2>
              {content.content.difficulty && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {content.content.difficulty} level
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => toggleFlashCardsModal()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              Flash Cards
            </button>
          </div>
          <div className="h-px bg-purple-200 w-full"></div>
        </div>
      )}

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
