"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { connectToLessonSocket } from "../lib/socketHelpers";

export const UrlSubmitter = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const handleSubmit = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      // Simulate Bedrock API call to parse lesson
      const lessonId = await mockBedrockApiCall(url);

      // Connect to WebSocket server & start lesson
      const ws = connectToLessonSocket(lessonId);
      setSocket(ws);

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const mockBedrockApiCall = async (url: string) => {
    console.log("Simulating API call for:", url);
    await new Promise((res) => setTimeout(res, 1500)); // Simulate latency
    return "mock-lesson-id-123"; // Simulated lessonId from API
  };

  return (
    <Card className="w-full bg-[var(--muted)] shadow-soft p-4 space-y-4">
      <CardContent className="p-0 flex flex-col space-y-3">
        <Input
          type="url"
          placeholder="Paste a URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="bg-white rounded-pill text-sm px-4 py-3"
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="rounded-pill w-full text-sm flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
          {isLoading ? "Generating..." : "Generate Course →"}
        </Button>
      </CardContent>
    </Card>
  );
};
