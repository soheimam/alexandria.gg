'use client'
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), {
  ssr: false
});

export const PayoutCard = ({ totalPayout }: { totalPayout: number }) => {
  return (
    <MotionDiv whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="bg-[var(--pastel-yellow)] shadow-soft rounded-2xl min-h-[150px] flex items-center">
        <CardContent className="p-6 space-y-2">
          <p className="text-sm text-[var(--secondary)]">Total Paid Out</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">${totalPayout.toFixed(2)}</p>
        </CardContent>
      </Card>
    </MotionDiv>
  );
};
