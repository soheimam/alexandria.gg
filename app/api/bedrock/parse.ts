import { BedrockResponse } from "@/types/bedrock";

export const parseBedrockResponse = (response: BedrockResponse) => {
  const lessonId = response.id || `lesson_${Date.now()}`;

  const meta = {
    title: response.lessonTitle || "Untitled Lesson",
    sourceUrl: response.source || "",
    estimatedDuration: response.estimatedDuration || "10 min",
    objectives: response.objectives || [],
  };

const modules = (response.modules || []).map((mod: any, idx: number) => ({
    id: mod.id || `module_${idx}`,
    type: mod.type || "text",
    content: mod.content || "",
    ...(mod.quizOptions ? { quizOptions: mod.quizOptions } : {}),
    ...(mod.correctAnswer ? { correctAnswer: mod.correctAnswer } : {}),
  }));

  return {
    type: "lesson_created",
    lessonId,
    meta,
    modules,
  };
};
