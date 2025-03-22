import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export const PayoutCard = ({ totalPayout }: { totalPayout: number }) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="bg-[var(--pastel-yellow)] shadow-soft rounded-2xl min-h-[150px] flex items-center">
        <CardContent className="p-6 space-y-2">
          <p className="text-sm text-[var(--secondary)]">Total Paid Out</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">${totalPayout.toFixed(2)}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
