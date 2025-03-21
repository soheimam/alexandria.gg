// /types/lesson.ts

export type LessonMeta = {
    title: string;
    sourceUrl: string;
    estimatedDuration: string; // e.g., "15 min"
    objectives: string[]; // learning goals
  };
  
  export type LessonModule = {
    id: string;
    type: "text" | "quiz" | "code" | "voice"; // could expand later
    content: string;
    quizOptions?: string[];
    correctAnswer?: string;
  };
  
  export type Lesson = {
    meta: LessonMeta;
    modules: LessonModule[];
  };
  