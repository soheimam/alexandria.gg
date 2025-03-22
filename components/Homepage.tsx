"use client";
import { DifficultySlider } from "@/components/difficultySlider";
import { LanguageSelector } from "@/components/lamguageSelector";
import { MascotAgent } from "@/components/mascotAgent";
import { UrlSubmitter } from "@/components/urlSubmitter";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import { useEffect, useState } from "react";

export const Homepage = () => {
  const { connect, send, isConnected } = useWebSocket("123");
  const { language, difficulty } = useAppStore();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    connect();
  }, [connect]);

  const handleWebSocketSend = async (url: string, address: string) => {
    if (!isConnected) {
      connect();
      if (!isConnected) {
        throw new Error("Failed to establish connection");
      }
    }

    send({
      userId: address,
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
