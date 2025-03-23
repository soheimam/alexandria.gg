"use client";

import { motion } from "framer-motion";
import { Loader2, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface VoiceTranscriptProps {
  text: string;
  isSpeaking: boolean;
}

export const VoiceTranscript = ({ text, isSpeaking }: VoiceTranscriptProps) => {
  // Remove dependency on global state
  // const { transcript } = useAppStore();
  const [visibleWords, setVisibleWords] = useState<string[]>([]);

  // Process text with proper spaces
  const processTranscript = useMemo(() => {
    // Regular expression to insert spaces between words (looking for lowercase to uppercase transitions)
    if (!text) return "";

    console.log("Processing text input:", text);

    // Add spaces before uppercase letters that follow lowercase letters
    const formatted = text.replace(/([a-z])([A-Z])/g, '$1 $2');
    // Add spaces before numbers that follow letters
    const withNumberSpaces = formatted.replace(/([a-zA-Z])(\d)/g, '$1 $2');
    // Add spaces after punctuation that isn't followed by a space
    const processed = withNumberSpaces.replace(/([.,!?;:])([a-zA-Z0-9])/g, '$1 $2');

    console.log("Processed text:", processed);
    return processed;
  }, [text]);

  const words = useMemo(() => {
    const splitWords = processTranscript?.split(/\s+/).filter(Boolean) || [];
    console.log("Split words:", splitWords);

    // Deduplicate adjacent repeated words to fix the doubling issue
    const deduplicatedWords = splitWords.filter((word, i, arr) =>
      i === 0 || word !== arr[i - 1]
    );

    console.log("Deduplicated words:", deduplicatedWords);
    return deduplicatedWords;
  }, [processTranscript]);

  // Gradually reveal words for a more controlled animation
  useEffect(() => {
    if (!words.length) return;

    console.log("Setting up word animation for", words.length, "words");

    // Start with no visible words
    setVisibleWords([]);

    // Show words gradually
    let currentIndex = 0;

    // Use a simple interval instead of a recursive setTimeout
    const interval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(interval);
        return;
      }

      setVisibleWords(prev => {
        // Important: Create a new array reference to ensure render
        const newWords = [...prev, words[currentIndex]];
        return newWords;
      });

      currentIndex++;
    }, 100); // Show a new word every 100ms

    // Cleanup interval on unmount or when words change
    return () => clearInterval(interval);
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
              duration: 0.5,
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
