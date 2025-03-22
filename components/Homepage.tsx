"use client";
import { UrlSubmitter } from "@/components/urlSubmitter";
import { MascotAgent } from "@/components/mascotAgent";
import { LanguageSelector } from "@/components/lamguageSelector";
import { DifficultySlider } from "@/components/difficultySlider";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export const Homepage = () => {
  const { connect, send, isConnected } = useWebSocket("123");
  const { language, difficulty } = useAppStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const initializeWebSocket = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      await connect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      setConnectionError(errorMessage);
      toast.error("Connection failed. Retrying...");
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  useEffect(() => {
    initializeWebSocket();

    // Attempt to reconnect every 5 seconds if not connected
    const reconnectInterval = setInterval(() => {
      if (!isConnected && !isConnecting) {
        initializeWebSocket();
      }
    }, 5000);

    return () => {
      clearInterval(reconnectInterval);
    };
  }, [initializeWebSocket, isConnected, isConnecting]);

  const handleWebSocketSend = async (url: string) => {
    if (!isConnected) {
      toast.error("Not connected. Attempting to reconnect...");
      await initializeWebSocket();
      if (!isConnected) {
        throw new Error("Failed to establish connection");
      }
    }

    try {
      await send({
        type: "generate_course",
        userId: "123",
        url,
        language,
        difficulty,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
      {/* Mascot */}
      <MascotAgent />
      <h1 className="text-3xl font-bold text-[var(--foreground)] leading-tight">
        Create bite-sized lessons from any link
      </h1>

      <LanguageSelector />
     
      <DifficultySlider />

      <UrlSubmitter 
        onWebSocketSend={handleWebSocketSend}
        isConnectionReady={isConnected && !isConnecting}
      />

      {/* Headline */}
    
    </div>
  );
};
