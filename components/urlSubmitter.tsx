"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/state/appStore";

interface UrlSubmitterProps {
  onWebSocketSend: (url: string) => void;
  isConnectionReady: boolean;
}

export const UrlSubmitter = ({ onWebSocketSend, isConnectionReady }: UrlSubmitterProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const socket = useAppStore((s) => s.socket);

  const handleSubmit = async () => {
    if (!url) return;
    if (!isConnectionReady || !socket) {
      console.error("WebSocket connection not ready");
      return;
    }
    
    setIsLoading(true);

    try {
      // Send directly through the socket
      socket.send(JSON.stringify({
        type: "generate_course",
        url
      }));
      
      // Also call the provided callback for any additional handling
      await onWebSocketSend(url);
      
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
        disabled={isLoading || !isConnectionReady}
        className="bg-[var(--muted)] rounded-pill text-sm px-4 py-3"
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !isConnectionReady || !socket}
        className="rounded-pill w-full text-sm flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
        {!isConnectionReady || !socket
          ? "Connecting..." 
          : isLoading 
            ? "Generating..." 
            : "Generate Course →"
        }
      </Button>
    </div>
  );
};
