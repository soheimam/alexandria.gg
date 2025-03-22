"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/state/appStore";

export const useWebSocket = (userId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const setSocket = useAppStore((s) => s.setSocket);

  const connect = () => {
    if (wsRef.current) return;

    const ws = new WebSocket(
      `wss://1uncj7q7r0.execute-api.us-east-1.amazonaws.com/prod?userId=${userId}`
    );
    wsRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      console.log("Incoming message:", data);
      // 🚨 Here we can later dispatch data into the store (e.g., setLessonMeta, etc.)
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;
      setSocket(null as unknown as WebSocket);
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsConnected(false);
    };
  };

  const send = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { connect, send, ws: wsRef, isConnected };
};
