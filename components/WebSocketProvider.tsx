"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useTranscript } from "@/state/transcriptContext";
import { ReactNode, useEffect } from "react";

export const WebSocketProvider = ({
    lessonId,
    children
}: {
    lessonId: string;
    children: ReactNode;
}) => {
    console.log("WebSocketProvider rendering with lessonId:", lessonId);

    // Check if transcript context is available
    const { transcript } = useTranscript();
    console.log("WebSocketProvider can access transcript context:", !!transcript !== undefined);

    const { connect } = useWebSocket(lessonId);

    // Set up WebSocket connection when component mounts
    useEffect(() => {
        console.log("WebSocketProvider: Connecting to WebSocket");
        connect();
    }, [connect]);

    return <>{children}</>;
}; 