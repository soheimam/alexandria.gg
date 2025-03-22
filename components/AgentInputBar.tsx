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
        className="flex-1 rounded-3xl text-sm px-5 py-3 bg-[var(--muted)] border-none shadow-inner focus:ring-0 focus:outline-none placeholder:text-[var(--secondary)]"
      />
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          onClick={handleSubmit}
          disabled={!inputText.trim()}
          className="rounded-3xl px-4 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:shadow-md transition"
        >
          <Send size={18} />
        </Button>
      </motion.div>
    </motion.div>
  );
};
