'use client'
import { Card, CardContent } from "../../components/ui/card";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), {
  ssr: false
});

export const StudyStatsCard = ({ totalMinutes }: { totalMinutes: number }) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <MotionDiv whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="bg-[var(--pastel-green)] shadow-soft rounded-2xl min-h-[150px] flex items-center">
        <CardContent className="p-6 space-y-2">
          <p className="text-sm text-[var(--secondary)]">Total Study Time</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{hours}h {mins}m</p>
        </CardContent>
      </Card>
    </MotionDiv>
  );
};
