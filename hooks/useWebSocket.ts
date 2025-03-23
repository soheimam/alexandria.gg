"use client";

import { useAppStore } from "@/state/appStore";
import { Language, useConversation } from '@11labs/react';
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export type Role = "user" | "ai";

export const useWebSocket = (userId: string, lessonId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inCall, setInCall] = useState(false);
  const setSocket = useAppStore((s) => s.setSocket);
  const [spokenText, setSpokenText] = useState("");
  const [prevSpokenText, setPrevSpokenText] = useState("");
  const { toggleFlashCardsModal } = useAppStore();
  const isSessionStartedRef = useRef(false);

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
    }
  });

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected, skipping new connection");
      setIsConnected(true);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log("WebSocket already connecting, skipping new connection attempt");
      return;
    }

    if (!userId || !lessonId) {
      console.log("No user ID or lesson ID provided for connection");
      return;
    }

    console.log(`Creating new WebSocket connection for userId:${userId}, lessonId:${lessonId}`);
    const ws = new WebSocket(
      `wss://1uncj7q7r0.execute-api.us-east-1.amazonaws.com/prod?userId=${userId}&lessonId=${lessonId}`
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

      if (data.type === "NOTIFICATION") {
        // Show toast notification for successful payment
        toast.success("Payment Successful!", {
          description: `You received ${data.amount} tokens for lesson completion.`,
          duration: 10000,
          action: {
            label: "View Transaction",
            onClick: () => window.open(`https://basescan.org/tx/${data.txHash}`, "_blank"),
          },
        });
      } else if (data.type === "status_update") {
        toast.success("Processing content...", {
          description: data.message,
          duration: 8000,
        });
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
      } else if (data.topic && !isSessionStartedRef.current) {
        // Set flag to prevent duplicate sessions
        isSessionStartedRef.current = true;

        // await endSession();
        console.log("starting session with dynamic variables", {
          user_id: userId,
          lesson_id: lessonId,
        });
        startSession({
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID as string,
          dynamicVariables: {
            user_id: userId,
            lesson_id: lessonId,
          },
          onConnect: () => {
            console.log("Connected to conversation");
            setInCall(true);
          },
          onError: (error: unknown) => {
            console.error("Conversation error:", error);
            setInCall(false);
          },
          onDisconnect: () => {
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
              console.log("Message content structure:", JSON.stringify(props.message));
              // Only update one source of truth - either transcript OR spokenText, not both
              // setTranscript(`${props.message} `);

              // Always create a new string reference by adding a timestamp 
              // to force React to recognize the state change
              const timestamp = Date.now();
              const text = props.message.trim();

              // Check if the text has weird doubling
              if (text.split(' ').some((word, i, arr) => i > 0 && word === arr[i - 1])) {
                console.warn("Detected repeated words in message:", text);
              }

              // Deduplicate repeated words
              const deduplicatedText = text.split(' ')
                .filter((word, i, arr) => i === 0 || word !== arr[i - 1])
                .join(' ');

              console.log(`Setting text with timestamp ${timestamp}:`, deduplicatedText);

              // Update local state only
              setSpokenText(`${deduplicatedText}`); // Removed extra space at end
            } else if (props.source === "user") {
              console.log("User speaking, clearing AI text");
              setSpokenText("");
            }
          },
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

  const send = useCallback(async (data: any) => {
    console.log("Sending message:", data);
    console.log("WebSocket readyState:", wsRef.current?.readyState);
    console.log("The socket is ", wsRef.current);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      data.action = "sendMessage";
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.log("WebSocket is not connected, trying to connect");
      connect();
      await new Promise(resolve => setTimeout(resolve, 1000));
      data.action = "sendMessage";
      wsRef.current?.send(JSON.stringify(data));
    }
  }, []);

  return { connect, send, ws: wsRef, isConnected, isSpeaking, spokenText };
};
