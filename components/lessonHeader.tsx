import { Card, CardContent } from "@/components/ui/card";
import { LessonMeta } from "@/app/lib/lesson";

export const LessonHeader = ({ meta }: { meta: LessonMeta }) => {
  return (
    <Card className="bg-[var(--muted)] shadow-soft rounded-2xl p-5">
      <CardContent className="space-y-4 p-0">
        <h2 className="text-xl font-bold text-[var(--foreground)] leading-tight">{meta.title}</h2>
        <p className="text-sm text-[var(--secondary)]">{meta.estimatedDuration}</p>

        <div className="space-y-2">
          {meta.objectives.map((obj, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-[var(--pastel-blue)] rounded-xl px-3 py-2"
            >
              <span className="text-[var(--primary)] text-base">✅</span>
              <p className="text-sm text-[var(--foreground)]">{obj}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
