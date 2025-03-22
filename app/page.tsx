import { Homepage } from "@/components/Homepage";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-between p-6 space-y-8">
      {/* Header Section */}
      <Homepage />
      

      {/* Footer */}
      <div className="text-center text-xs text-[var(--secondary)]">
        © {new Date().getFullYear()} YourAppName. Learning made simple.
      </div>
    </main>
  );
}
