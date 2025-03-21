"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; // ShadCN-compatible spinner

export const UrlSubmitter = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      // 1. Call backend API to trigger Bedrock/Claude content parsing
      // 2. WebSocket event logic here (e.g., open lesson socket)

      await new Promise((res) => setTimeout(res, 2000)); // simulate for now
      
      // Redirect or update app state here after successful flow
      console.log("Submitted:", url);
    } catch (err) {
      console.error("Error submitting URL:", err);
    } finally {
      setIsLoading(false);
    }
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
