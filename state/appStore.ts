import { create } from "zustand";
import { LessonMeta, LessonModule } from "../app/lib/lesson";

type ChatMessage = { sender: "user" | "ai"; message: string };

type AppState = {
  // Lesson info
  lessonId: string;
  lessonMeta: LessonMeta | null;
  lessonModules: LessonModule[];
  currentModuleIndex: number;
  language: string;
  setLanguage: (lang: string) => void;
  difficulty: number; // 1 = easy, 2 = medium, 3 = hard
  setDifficulty: (level: number) => void;

  //websocket
  socket: WebSocket | null;
  setSocket: (ws: WebSocket) => void;


  // AI agent state
  chatHistory: ChatMessage[];
  transcript: string;

  // Actions
  setLessonId: (id: string) => void;
  setLessonMeta: (meta: LessonMeta) => void;
  setLessonModules: (modules: LessonModule[]) => void;
  nextModule: () => void;
  setTranscript: (text: string) => void;
  pushChat: (message: ChatMessage) => void;
  resetLesson: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  lessonId: "",
  lessonMeta: null,
  lessonModules: [],
  currentModuleIndex: 0,
  chatHistory: [],
  transcript: "",
  language: "English",
  setLanguage: (lang) => set({ language: lang }),
  difficulty: 1,
  setDifficulty: (level) => set({ difficulty: level }),
  socket: null,
  setSocket: (ws) => set({ socket: ws }),

  // Actions
  setLessonId: (id) => set({ lessonId: id }),
  setLessonMeta: (meta) => set({ lessonMeta: meta }),
  setLessonModules: (modules) => set({ lessonModules: modules }),
  nextModule: () => set((state) => ({ currentModuleIndex: state.currentModuleIndex + 1 })),
  setTranscript: (text) => set({ transcript: text }),
  pushChat: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  resetLesson: () =>
    set({
      lessonId: "",
      lessonMeta: null,
      lessonModules: [],
      currentModuleIndex: 0,
      chatHistory: [],
      transcript: "",
    }),
}));
