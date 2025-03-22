import { LessonPageContent } from "@/components/LessonPageContent";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: LessonPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-between p-6 space-y-6">
      <LessonPageContent lessonId={id} />
    </main>
  );
}
