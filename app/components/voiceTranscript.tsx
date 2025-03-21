"use client";

import { useEffect, useRef, useState } from "react";
import { playVoiceAgentMessage } from "../lib/voiceAgent";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const VoiceTranscript = ({ text }: { text: string }) => {
  const prevText = useRef("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!text || text === prevText.current) return;

    prevText.current = text;

    const speak = async () => {
      try {
        setIsSpeaking(true);
        await playVoiceAgentMessage(text);
      } catch (err) {
        console.error("Voice agent error:", err);
      } finally {
        setIsSpeaking(false);
      }
    };

    speak();
  }, [text]);

  return (
    <div className="bg-[var(--pastel-blue)] rounded-xl p-4 shadow-soft text-center min-h-[80px] flex items-center justify-center relative">
      {isSpeaking && (
        <Loader2 className="animate-spin absolute right-4 top-4 h-5 w-5 text-[var(--secondary)]" />
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={text} // triggers re-animation on text change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[var(--foreground)] text-base"
        >
          {text || "..."}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
