import { UserInfoCard } from "./userInfoCard";
import { StudyStatsCard } from "./studyStatsCard";
import { PayoutCard } from "./payoutCard";

export const BentoGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <UserInfoCard name="Alex Johnson" />
      <StudyStatsCard totalMinutes={275} />
      <PayoutCard totalPayout={128.5} />
    </div>
  );
};
