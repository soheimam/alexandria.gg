import { Card, CardContent } from "@/components/ui/card";
import { LessonMeta } from "../types/lesson";

export const LessonHeader = ({ meta }: { meta: LessonMeta }) => {
  return (
    <Card className="bg-[var(--muted)] shadow-soft p-4 rounded-xl">
      <CardContent className="space-y-2 p-0">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{meta.title}</h2>
        <p className="text-xs text-[var(--secondary)]">{meta.estimatedDuration}</p>
        <ul className="list-disc list-inside text-sm text-[var(--secondary)] space-y-1">
          {meta.objectives.map((obj, idx) => (
            <li key={idx}>{obj}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
