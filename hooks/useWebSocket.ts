"use client";

import { useAppStore } from "@/state/appStore";
import { Language, useConversation } from '@11labs/react';
import { useCallback, useRef, useState } from "react";

export type Role = "user" | "ai";

export const useWebSocket = (userId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inCall, setInCall] = useState(false);
  const setSocket = useAppStore((s) => s.setSocket);
  const [spokenText, setSpokenText] = useState("");
  const [prevSpokenText, setPrevSpokenText] = useState("");
  const { setTranscript, toggleFlashCardsModal } = useAppStore();

  console.log("useWebSocket initialized with userId:", userId);

  const { isSpeaking, endSession, startSession } = useConversation({
    onConnection: async () => {
      console.log("Connected to conversation");
      setInCall(true);
    },
    onError(error: unknown) {
      console.error("Conversation error:", error);
      setInCall(false);
    },
    onDisconnect() {
      console.log("Disconnected from conversation");
      setInCall(false);
    },
    clientTools: {
      flash_cards: (parameters: { text: string }) => {
        console.log("Flashcards:", parameters.text);
        toggleFlashCardsModal();
        return "The flashcards are now open in a new tab";
      },
    },
    onMessage(props: { message: string; source: Role; audio?: string }) {
      console.log("Received message:", props);
      if (props.source === "ai") {
        console.log("AI speaking:", props.message);
        setTranscript(`${props.message} `);

        // Always create a new string reference by adding a timestamp 
        // to force React to recognize the state change
        const timestamp = Date.now();
        const text = props.message.trim();

        console.log(`Setting text with timestamp ${timestamp}:`, text);

        // Update local state only
        setSpokenText(`${text} `); // Space at end creates new reference
        setPrevSpokenText(text);
      } else if (props.source === "user") {
        console.log("User speaking, clearing AI text");
        setSpokenText("");
        setPrevSpokenText("");
      }
    },
  });

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsConnected(true);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    if (!userId) {
      console.log("No user ID provided for connection");
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

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      console.log("Incoming message:", data);
      if (data.type === "status_update") {
        // const session = await startSession({
        //   agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID as string,
        //   overrides: {
        //     agent: {
        //       firstMessage: data.message,
        //       language: data.language as Language,
        //       prompt: {
        //         prompt: data.message, // We should send awaiting system prompt
        //       },
        //     },
        //   },
        // });
        // console.log("Session started:", session);
      } else if (data.topic) {
        // await endSession();
        startSession({
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID as string,
          overrides: {
            agent: {
              firstMessage: data.agent_first_message,
              language: data.language as Language,
              prompt: {
                prompt: data.agent_system_prompt,
              },
            },
          },
        });
      }
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
      data.action = "sendMessage";
      wsRef.current.send(JSON.stringify(data));
    } else {
      throw new Error("WebSocket is not connected");
    }
  }, []);

  return { connect, send, ws: wsRef, isConnected, isSpeaking, spokenText };
};
