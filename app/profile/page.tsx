import { BentoGrid } from "@/components/bentoGrid";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Your Dashboard</h1>
      <BentoGrid />
    </main>
  );
}
