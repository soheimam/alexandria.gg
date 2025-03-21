import Image from "next/image";
import { UrlSubmitter } from "./components/urlSubmitter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-between p-6">
    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Turn any link into a bite-sized lesson
      </h1>
      <p className="text-sm text-[var(--secondary)] max-w-sm">
        Paste a URL or video link and let our AI create a personalized micro-learning experience for you.
      </p>

      <UrlSubmitter />
    </div>

    <div className="mt-10 text-center text-xs text-[var(--secondary)]">
      © {new Date().getFullYear()} YourAppName. Learn smarter, faster.
    </div>
  </main>
  );
}
