'use client'
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), {
  ssr: false
});

export const UserInfoCard = ({ name }: { name: string }) => {
  return (
    <>
      <MotionDiv whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card className="bg-[var(--muted)] shadow-soft rounded-2xl min-h-[150px] flex items-center">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-[var(--pastel-blue)] rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold text-[var(--foreground)]">
              {name[0]}
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--foreground)]">{name}</p>
              <p className="text-sm text-[var(--secondary)]">Active learner</p>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </>
  );
};
