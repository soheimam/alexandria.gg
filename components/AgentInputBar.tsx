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
      className="sticky bottom-0 bg-[var(--background)] py-4 flex gap-3 items-center rounded-t-2xl shadow-soft px-4"
    >
      <Input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your question here..."
        className="h-14 rounded-lg border-gray-200 bg-white flex-1 px-6"
      />
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleSubmit}
          disabled={!inputText.trim()}
          className="h-14 rounded-lg bg-pink-500 hover:bg-pink-600 text-white px-6 font-medium text-lg pink"
        >
          <Send size={18} />
        </Button>
      </motion.div>
    </motion.div>
  );
};
