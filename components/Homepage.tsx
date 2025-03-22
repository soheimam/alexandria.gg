"use client";

import { DifficultySlider } from "@/components/difficultySlider";
import { LanguageSelector } from "@/components/languageSelector";
import { MascotAgent } from "@/components/mascotAgent";
import { UrlSubmitter } from "@/components/urlSubmitter";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import { Language } from "@11labs/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const Homepage = () => {
  const { address } = useAccount();
  const { connect, send, isConnected } = useWebSocket(address as string);
  const language = useAppStore((s) => s.language);
  const difficulty = useAppStore((s) => s.difficulty);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    console.log("Connecting to WebSocket");
    connect();
  }, [connect]);

  const handleWebSocketSend = async (url: string, address: string, name: string) => {
    if (!isConnected) {
      connect();
      if (!isConnected) {
        throw new Error("Failed to establish connection");
      }
    }

    send({
      user_id: address, // TODO: change to user_id
      name: name || address, // TODO: change to base name
      id: address, // TODO: change to id (can be something unique)
      url,
      language: language.toLowerCase() as Language,
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
