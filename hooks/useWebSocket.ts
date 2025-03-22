"use client";

import { useAppStore } from "@/state/appStore";
import { useCallback, useRef, useState } from "react";

export const useWebSocket = (userId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const setSocket = useAppStore((s) => s.setSocket);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsConnected(true);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

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
  }, [userId, setSocket]);

  const send = useCallback((data: any) => {
    console.log("Sending message:", data);
    console.log("WebSocket readyState:", wsRef.current?.readyState);
    console.log("The socket is ", wsRef.current);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      throw new Error("WebSocket is not connected");
    }
  }, []);

  return { connect, send, ws: wsRef, isConnected };
};
