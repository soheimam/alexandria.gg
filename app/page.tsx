import { Homepage } from "@/components/Homepage";
import { WalletConnect } from "@/components/walletConnect";
import { Card, CardContent } from "@/components/ui/card";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#f0e6f5] p-4 md:p-8 flex flex-col items-center justify-center">
         <Card className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <WalletConnect />
            {/* Header Section */}
            <Homepage />
          </CardContent>
        </Card>

      {/* Footer */}
      <div className="text-center text-xs text-[var(--secondary)]">
        © {new Date().getFullYear()} YourAppName. Learning made simple.
      </div>
    </main>
  );
}
