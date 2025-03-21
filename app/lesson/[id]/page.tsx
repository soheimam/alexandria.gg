import { LessonPageContent } from "../../components/LessonPageContent";

type LessonPageProps = {
  params: { id: string };
};

export default function LessonPage({ params }: LessonPageProps) {
  const { id } = params;

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-between p-6 space-y-6">
      <LessonPageContent lessonId={id} />
    </main>
  );
}
