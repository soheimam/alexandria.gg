"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define the context shape
interface TranscriptContextType {
    transcript: string;
    setTranscript: (text: string) => void;
    isSpeaking: boolean;
    setIsSpeaking: (speaking: boolean) => void;
    updateCounter: number;
}

// Create context with default values
const TranscriptContext = createContext<TranscriptContextType>({
    transcript: '',
    setTranscript: () => {
        console.warn("setTranscript called on default context");
    },
    isSpeaking: false,
    setIsSpeaking: () => {
        console.warn("setIsSpeaking called on default context");
    },
    updateCounter: 0
});

// Custom hook to use the transcript context
export const useTranscript = () => {
    const context = useContext(TranscriptContext);
    if (!context) {
        console.error("useTranscript must be used within a TranscriptProvider");
    }
    return context;
};

// Provider component that wraps app
export const TranscriptProvider = ({ children }: { children: ReactNode }) => {
    console.log("TranscriptProvider rendering");
    const [transcript, setTranscriptState] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [updateCounter, setUpdateCounter] = useState(0);

    // Custom setter that ensures state updates and forces rerenders
    const setTranscript = (text: string) => {
        console.log("TranscriptContext: Setting transcript to:", text);
        setTranscriptState(text);
        setUpdateCounter(prev => prev + 1);
    };

    // Log updates for debugging
    useEffect(() => {
        console.log("TranscriptContext: Transcript updated to:", transcript);
    }, [transcript]);

    const contextValue = {
        transcript,
        setTranscript,
        isSpeaking,
        setIsSpeaking,
        updateCounter
    };

    console.log("TranscriptProvider providing value:", contextValue);

    return (
        <TranscriptContext.Provider value={contextValue}>
            {children}
        </TranscriptContext.Provider>
    );
}; 