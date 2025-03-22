"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/state/appStore";
import { useName } from "@coinbase/onchainkit/identity";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { base } from "viem/chains";
import { useAccount } from "wagmi";

interface UrlSubmitterProps {
  onWebSocketSend: (url: string, address: string, name: string) => void;
  isConnectionReady: boolean;
}

export const UrlSubmitter = ({ onWebSocketSend, isConnectionReady }: UrlSubmitterProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { data: name } = useName({ address: address as `0x${string}`, chain: base });
  const socket = useAppStore((s) => s.socket);

  const handleSubmit = async () => {
    if (!url) return;
    if (!isConnectionReady || !socket) {
      console.error("WebSocket connection not ready");
      return;
    }

    try {
      if (!address) {
        console.error("No address found");
        return;
      }
      setIsLoading(true);
      console.log("Sending to websocket:", url, address, name);
      onWebSocketSend(url, address, name);
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
