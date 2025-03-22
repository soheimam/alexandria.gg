import { UserInfoCard } from "@/components/userInfoCard";
import { StudyStatsCard } from "@/components/studyStatsCard";
import { PayoutCard } from "@/components/payoutCard";

export const BentoGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <UserInfoCard name="Alex Johnson" />
      <StudyStatsCard totalMinutes={275} />
      <PayoutCard totalPayout={128.5} />
    </div>
  );
};
