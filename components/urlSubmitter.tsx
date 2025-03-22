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
    <div className="w-full flex gap-2 items-center">
      <Input
        type="url"
        placeholder="Paste URL here"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading || !isConnectionReady}
        className="h-14 rounded-lg border-gray-200 bg-white flex-1 px-6"
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !isConnectionReady || !socket}
        className="h-14 rounded-lg bg-pink-500 hover:bg-pink-600 text-white px-6 font-medium text-lg pink"
      >
        {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
        {!isConnectionReady || !socket
          ? "Connecting..."
          : isLoading
            ? "Learning..."
            : "Learn"
        }
      </Button>
    </div>
  );
};
