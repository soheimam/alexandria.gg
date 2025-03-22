"use client";
import { UrlSubmitter } from "@/components/urlSubmitter";
import { MascotAgent } from "@/components/mascotAgent";
import { LanguageSelector } from "@/components/lamguageSelector";
import { DifficultySlider } from "@/components/difficultySlider";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import { useEffect, useState, useCallback } from "react";

export const Homepage = () => {
  const { connect, send, isConnected } = useWebSocket("123");
  const { language, difficulty } = useAppStore();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    connect();
  }, [connect]);

  const handleWebSocketSend = async (url: string) => {
    if (!isConnected) {
      await connect();
      if (!isConnected) {
        throw new Error("Failed to establish connection");
      }
    }

    await send({
      type: "generate_course",
      userId: "123",
      url,
      language,
      difficulty,
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
      {/* Mascot */}
      <MascotAgent />
      <h1 className="text-3xl font-bold text-[var(--foreground)] leading-tight">
        Create bite-sized lessons from any link
      </h1>
        {/* Headline */}
      <LanguageSelector />
     
      <DifficultySlider />

      <UrlSubmitter 
        onWebSocketSend={handleWebSocketSend}
        isConnectionReady={isConnected}
      />

   
    
    </div>
  );
};
