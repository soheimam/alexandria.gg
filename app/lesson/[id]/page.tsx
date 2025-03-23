import { LessonPageContent } from "@/components/LessonPageContent";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
type LessonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: LessonPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#f0e6f5] p-4 md:p-8 flex flex-col items-center justify-center">
         <Navigation />
      <Card className="min-h-[420px] w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <LessonPageContent lessonId={id} />
        </CardContent>
      </Card>
    </main>
  );
}
