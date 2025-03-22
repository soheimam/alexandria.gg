"use client";

import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/state/appStore";

export const DifficultySlider = () => {
  const difficulty = useAppStore((s) => s.difficulty);
  const setDifficulty = useAppStore((s) => s.setDifficulty);

  const difficultyOptions = [
    { icon: "🍼", label: "Easy", value: 1 },
    { icon: "🍎", label: "Medium", value: 2 },
    { icon: "🤓", label: "Hard", value: 3 },
  ];

  // Get description based on current difficulty
  const getDifficultyInfo = () => {
    switch(difficulty) {
      case 1:
        return {
          title: "Beginner Friendly",
          description: "Perfect for newcomers. Learn at a comfortable pace with more hints and simplified exercises."
        };
      case 2:
        return {
          title: "Balanced Challenge",
          description: "A balanced approach with moderate challenges. Ideal for those with some prior knowledge."
        };
      case 3:
        return {
          title: "Expert Level",
          description: "Challenging content for advanced learners. Complex exercises with minimal assistance."
        };
      default:
        return {
          title: "Beginner Friendly",
          description: "Perfect for newcomers. Learn at a comfortable pace with more hints and simplified exercises."
        };
    }
  };

  const difficultyInfo = getDifficultyInfo();

  return (
    <div className="flex flex-col space-y-6 w-full max-w-md">
      <h2 className="text-4xl font-bold text-black">Select Difficulty</h2>
      
      <div className="space-y-6">
        <div className="relative">
          {/* Icons above the slider */}
          <div className="flex justify-between mb-2">
            {difficultyOptions.map((option) => (
              <div
                key={option.value}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
                  difficulty === option.value ? "bg-pink-100" : "bg-white"
                }`}
              >
                {option.icon}
              </div>
            ))}
          </div>

          {/* Custom slider */}
          <div className="py-2">
            <style jsx global>{`
              [data-slot="slider-track"] {
                height: 8px !important;
                background: #E5E7EB !important;
                border-radius: 9999px !important;
              }
              [data-slot="slider-range"] {
                background: #EC4899 !important;
              }
              [data-slot="slider-thumb"] {
                width: 24px !important;
                height: 24px !important;
                background: white !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                border: 2px solid #EC4899 !important;
              }
            `}</style>
            <Slider
              min={1}
              max={3}
              step={1}
              value={[difficulty]}
              onValueChange={(val) => setDifficulty(val[0])}
              className="w-full cursor-pointer z-20"
            />
          </div>

          {/* Labels below the slider */}
          <div className="flex justify-between text-base font-medium mt-1">
            {difficultyOptions.map((option) => (
              <span 
                key={option.value} 
                className={difficulty === option.value ? "text-pink-500" : "text-gray-500"}
              >
                {option.label}
              </span>
            ))}
          </div>
        </div>

        {/* Difficulty info box */}
        <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
          <h3 className="font-medium text-pink-700 mb-1 text-xl">
            {difficultyInfo.title}
          </h3>
          <p className="text-pink-600">
            {difficultyInfo.description}
          </p>
        </div>
      </div>
    </div>
  );
};
