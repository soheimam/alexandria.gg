"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

export const AgentInputBar = ({ onSubmit }: { onSubmit: (msg: string) => void }) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    onSubmit(inputText);
    setInputText("");
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [inputText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky bottom-0 bg-[var(--background)] py-3 flex gap-2 items-center"
    >
      <Input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ask the AI agent..."
        className="flex-1 rounded-pill text-sm px-4 py-3"
      />
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          onClick={handleSubmit}
          disabled={!inputText.trim()}
          className="rounded-pill flex gap-1 items-center"
        >
          <Send size={16} />
        </Button>
      </motion.div>
    </motion.div>
  );
};
