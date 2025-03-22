"use client";

import { useAppStore } from "@/state/appStore";
import { motion } from "framer-motion";
import { Loader2, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface VoiceTranscriptProps {
  text: string;
  isSpeaking: boolean;
}

export const VoiceTranscript = ({ text, isSpeaking }: VoiceTranscriptProps) => {
  const { transcript } = useAppStore();
  const [visibleWords, setVisibleWords] = useState<string[]>([]);

  // Process text with proper spaces
  const processTranscript = useMemo(() => {
    // Regular expression to insert spaces between words (looking for lowercase to uppercase transitions)
    if (!transcript) return "";

    // Add spaces before uppercase letters that follow lowercase letters
    const formatted = transcript.replace(/([a-z])([A-Z])/g, '$1 $2');
    // Add spaces before numbers that follow letters
    const withNumberSpaces = formatted.replace(/([a-zA-Z])(\d)/g, '$1 $2');
    // Add spaces after punctuation that isn't followed by a space
    return withNumberSpaces.replace(/([.,!?;:])([a-zA-Z0-9])/g, '$1 $2');
  }, [transcript]);

  const words = useMemo(() => {
    return processTranscript?.split(/\s+/).filter(Boolean) || [];
  }, [processTranscript]);

  // Gradually reveal words for a more controlled animation
  useEffect(() => {
    if (!words.length) return;

    const showWords = async () => {
      setVisibleWords([]);
      for (let i = 0; i < words.length; i++) {
        // Slow down the animation - increased delay from 80ms to 150ms
        await new Promise(r => setTimeout(r, 150));
        setVisibleWords(prev => [...prev, words[i]]);
      }
    };

    showWords();
  }, [words]);

  return (
    <div className="bg-[var(--pastel-blue)] rounded-xl p-6 shadow-soft text-center relative w-full min-h-[80px] flex items-center justify-center overflow-hidden">
      {isSpeaking && (
        <div className="absolute right-4 top-4 flex items-center">
          <Volume2 className="w-5 h-5 text-[var(--secondary)] mr-2" />
          <Loader2 className="animate-spin h-5 w-5 text-[var(--secondary)]" />
        </div>
      )}

      <p className="text-[var(--foreground)] text-xl font-medium leading-relaxed w-full max-w-[90%] mx-auto whitespace-normal">
        {visibleWords.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.5, // Slower animation (0.3 to 0.5)
              ease: "easeOut"
            }}
            className="inline-block mx-[0.3em] my-[0.15em]"
          >
            {word}
          </motion.span>
        ))}
        {isSpeaking && (
          <motion.span
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
            }}
            className="inline-block w-1.5 h-5 ml-1 bg-[var(--secondary)] rounded-sm"
          />
        )}
      </p>
    </div>
  );
};
