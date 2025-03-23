"use client";

import { DifficultySlider } from "@/components/difficultySlider";
import { LanguageSelector } from "@/components/languageSelector";
import { UrlSubmitter } from "@/components/urlSubmitter";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useAppStore } from "@/state/appStore";
import { Language } from "@11labs/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export const Homepage = () => {
  const { address } = useAccount();
  const { connect, send, isConnected } = useWebSocket(address as string, "1");
  const language = useAppStore((s) => s.language);
  const difficulty = useAppStore((s) => s.difficulty);
  const router = useRouter();

  const generateId = (url: string) => {
    // Simple hash function for URL, language and difficulty
    const hashString = `${url}:${language}:${difficulty}`;
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to positive hex string and take first 12 characters
    return Math.abs(hash).toString(16).substring(0, 12);
  }

  useEffect(() => {
    console.log("Connecting to WebSocket");
    connect();
  }, [connect]);

  const handleWebSocketSend = async (url: string, address: string, name: string) => {
    if (!isConnected) {
      connect();
      if (!isConnected) {
        throw new Error("Failed to establish connection");
      }
    }

    const id = generateId(url);
    send({
      user_id: address,
      name: name || address, // TODO: change to base name
      id,
      url,
      language: language.toLowerCase() as Language,
      difficulty,
    });

    router.push(`/lesson/${id}`);
  };

  // Pastel colors for background elements
  const bgColors = [
    { color: 'hsla(350, 60%, 95%, 0.5)', size: '300px', left: '-5%', top: '5%', blur: '60px' },
    { color: 'hsla(280, 60%, 95%, 0.4)', size: '250px', right: '-10%', top: '10%', blur: '50px' },
    { color: 'hsla(190, 60%, 95%, 0.4)', size: '280px', left: '15%', bottom: '5%', blur: '55px' },
    { color: 'hsla(230, 60%, 95%, 0.3)', size: '320px', right: '5%', bottom: '15%', blur: '70px' },
  ];

  // Bubble colors for small floating elements
  const bubbleColors = [
    'hsla(350, 80%, 85%, 0.35)', // Pink
    'hsla(280, 80%, 85%, 0.35)', // Purple
    'hsla(190, 80%, 85%, 0.35)', // Blue
    'hsla(120, 70%, 85%, 0.35)', // Green
    'hsla(40, 90%, 85%, 0.35)',  // Yellow
    'hsla(20, 80%, 85%, 0.35)',  // Orange
  ];

  // Pastel colors for the mascot bubbles (slightly more opaque)
  const mascotBubbleColors = [
    'hsla(350, 80%, 85%, 0.6)', // Pink
    'hsla(280, 80%, 85%, 0.6)', // Purple
    'hsla(190, 80%, 85%, 0.6)', // Blue
    'hsla(120, 70%, 85%, 0.6)', // Green
    'hsla(40, 90%, 85%, 0.6)',  // Yellow
    'hsla(20, 80%, 85%, 0.6)',  // Orange
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center text-center px-4 py-6 relative overflow-hidden">


      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bgColors.map((blob, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-60"
            style={{
              width: blob.size,
              height: blob.size,
              left: blob.left,
              right: blob.right,
              top: blob.top,
              bottom: blob.bottom,
              backgroundColor: blob.color,
              filter: `blur(${blob.blur})`,
              animation: `float-bg ${10 + i * 5}s infinite ease-in-out ${i * 2}s`,
            }}
          />
        ))}

        {/* Small floating bubbles */}
        {[...Array(12)].map((_, i) => {
          const size = Math.random() * 30 + 15;
          const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: color,
                filter: `blur(${Math.random() + 0.5}px)`,
                animation: `float-bubble ${Math.random() * 20 + 15}s infinite ease-in-out ${Math.random() * 10}s`,
              }}
            />
          );
        })}
      </div>

      {/* Unified header container with Alexandria title and educational character */}
      <div className="w-full max-w-xl mx-auto mb-6 relative z-20">
        {/* Single container with rounded corners for both title and image */}
        <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-white/50 bg-[#EFF1FB]">
          {/* Common shared background for both title and image */}
          <div className="absolute inset-0 bg-[#EFF1FB]"></div>

          {/* Bubbles that float throughout the entire container */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {[...Array(40)].map((_, i) => {
              const size = Math.random() * 35 + 10;
              const color = mascotBubbleColors[Math.floor(Math.random() * mascotBubbleColors.length)];
              const top = Math.random() * 100;
              const left = Math.random() * 100;

              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    top: `${top}%`,
                    left: `${left}%`,
                    background: color,
                    boxShadow: `0 0 6px ${color.replace('0.6', '0.3')}`,
                    animation: `float-bubble ${Math.random() * 15 + 10}s infinite ease-in-out ${Math.random() * 5}s`,
                    opacity: Math.random() * 0.4 + 0.4,
                  }}
                />
              );
            })}
          </div>

          {/* Title area */}
          <div className="relative z-20 pt-8 pb-2 px-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              Alexandria
            </h1>
          </div>

          {/* Image area with cream colored inner section */}
          <div className="relative z-20 pb-4 px-4">
            <div className="relative rounded-[28px] overflow-hidden border border-white/50 bg-[#f8f3e9]">
              {/* Image container with fade animation */}
              <div className="relative w-full aspect-[16/9] flex items-center justify-center">
                {/* First image - visible first */}
                <div className="absolute inset-0 flex items-center justify-center animate-fade-1">
                  <img
                    src="/edu_woman-1.png"
                    alt="Alexandria Educational Character"
                    className="w-[70%] h-auto object-contain"
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                </div>

                {/* Second image - fades in after first */}
                <div className="absolute inset-0 flex items-center justify-center animate-fade-2">
                  <img
                    src="/edu_woman-2.png"
                    alt="Alexandria Educational Character"
                    className="w-[70%] h-auto object-contain"
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-blur-md rounded-[32px] p-8 space-y-8 border border-white border-opacity-50 shadow-xl z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
          Turn any link into a lesson.
        </h2>

        {/* Language selector */}
        <LanguageSelector />

        {/* Difficulty slider */}
        <DifficultySlider />

        {/* URL input */}
        <UrlSubmitter
          onWebSocketSend={handleWebSocketSend}
          isConnectionReady={isConnected}
        />
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes float-bg {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(${Math.random() * 10}px, ${Math.random() * 10}px) rotate(${Math.random() * 3}deg); }
        }
        
        @keyframes float-bubble {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(${Math.random() * 20}px, -${Math.random() * 30}px) scale(1.1); }
          66% { transform: translate(-${Math.random() * 20}px, ${Math.random() * 20}px) scale(0.9); }
        }
        
        @keyframes fade-1 {
          0%, 45%, 100% { opacity: 1; }
          50%, 95% { opacity: 0; }
        }
        
        @keyframes fade-2 {
          0%, 45%, 100% { opacity: 0; }
          50%, 95% { opacity: 1; }
        }
      `}</style>

      {/* Global styles for animation classes */}
      <style jsx global>{`
        .animate-fade-1 {
          animation: fade-1 10s infinite;
        }
        .animate-fade-2 {
          animation: fade-2 10s infinite;
        }
      `}</style>
    </div>
  );
};
