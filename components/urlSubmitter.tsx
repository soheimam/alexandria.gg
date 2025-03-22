"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/state/appStore";
import { useWebSocket } from "@/hooks/useWebSocket"; // path to your hook

export const UrlSubmitter = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { language, difficulty } = useAppStore();

  const { connect, send } = useWebSocket("123");

  const handleSubmit = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      connect();

      send({
        type: "generate_course",
        userId: "123",
        url,
        language,
        difficulty,
      });

      // Redirect to mocked lesson page
      router.push("/lesson/mocklesson");
    } catch (err) {
      console.error("Error submitting:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <Input
        type="url"
        placeholder="Paste a URL here..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
        className="bg-[var(--muted)] rounded-pill text-sm px-4 py-3"
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="rounded-pill w-full text-sm flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
        {isLoading ? "Generating..." : "Generate Course →"}
      </Button>
    </div>
  );
};
