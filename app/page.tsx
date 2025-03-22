import Image from "next/image";
import { UrlSubmitter } from "./components/urlSubmitter";
import { MascotAgent } from "./components/mascotAgent";
import { LanguageSelector } from "./components/lamguageSelector";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-between p-6 space-y-8">
      {/* Header Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
        {/* Mascot */}
        <MascotAgent />

        {/* Headline */}
        <h1 className="text-3xl font-bold text-[var(--foreground)] leading-tight">
          Create bite-sized lessons from any link
        </h1>

        {/* Subtext */}
        <p className="text-base text-[var(--secondary)] max-w-xs">
          Paste a URL or video and let your AI study buddy craft a personalized learning journey.
        </p>

        {/* Url Submitter */}
        <div className="w-full max-w-md space-y-4">
          <UrlSubmitter />
          <LanguageSelector />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[var(--secondary)]">
        © {new Date().getFullYear()} YourAppName. Learning made simple.
      </div>
    </main>
  );
}
