"use client";

import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/state/appStore";

export const DifficultySlider = () => {
  const difficulty = useAppStore((s) => s.difficulty);
  const setDifficulty = useAppStore((s) => s.setDifficulty);

  // 5 visible difficulty options that map to 10 internal levels
  const difficultyOptions = [
    { icon: "🧸", label: "Beginner", value: 1 },
    { icon: "🎒", label: "Elementary", value: 3 },
    { icon: "🍎", label: "Intermediate", value: 5 },
    { icon: "📚", label: "Advanced", value: 7 },
    { icon: "🧠", label: "Expert", value: 10 },
  ];

  // Convert visible difficulty levels to internal 1-10 scale
  const getInternalDifficulty = (visibleLevel: number): number => {
    const option = difficultyOptions.find(opt => opt.value === visibleLevel);
    return option ? option.value : 1;
  };

  // Find the closest visible difficulty level from the internal value
  const getVisibleDifficulty = (internalLevel: number): number => {
    let closest = difficultyOptions[0];
    let minDiff = Math.abs(internalLevel - closest.value);

    difficultyOptions.forEach(option => {
      const diff = Math.abs(internalLevel - option.value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = option;
      }
    });

    return closest.value;
  };

  // Get description based on current difficulty
  const getDifficultyInfo = () => {
    const level = getInternalDifficulty(difficulty);

    if (level <= 2) {
      return {
        title: "Kid-Friendly Content",
        description: "Simple explanations designed for children ages 5-7. Colorful examples and basic concepts only."
      };
    } else if (level <= 4) {
      return {
        title: "Elementary Learning",
        description: "Appropriate for elementary school students (ages 8-11). Introduces fundamental concepts with engaging examples."
      };
    } else if (level <= 6) {
      return {
        title: "Intermediate Knowledge",
        description: "Middle and high school level content (ages 12-17). Balanced approach with clear explanations and some deeper concepts."
      };
    } else if (level <= 8) {
      return {
        title: "College Level",
        description: "Undergraduate complexity with more technical terminology and nuanced discussions of the subject matter."
      };
    } else {
      return {
        title: "Graduate & PhD Level",
        description: "Advanced academic content suitable for graduate students and experts. Complex theories and cutting-edge information."
      };
    }
  };

  const difficultyInfo = getDifficultyInfo();
  const activeOption = difficultyOptions.find(opt => opt.value === difficulty) || difficultyOptions[0];

  return (
    <div className="flex flex-col space-y-8 w-full">
      <h2 className="text-2xl font-bold text-gray-800">Select Difficulty</h2>

      <div className="space-y-8">
        <div className="relative">
          {/* Icons displayed in a spaced-out manner */}
          <div className="max-w-md mx-auto mb-10">
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {difficultyOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex justify-center items-center"
                >
                  {/* The entire container is styled here */}
                  <div
                    className={`relative flex justify-center items-center ${difficulty === option.value ? "z-10" : ""
                      }`}
                  >
                    {/* Pink background for active item */}
                    {difficulty === option.value && (
                      <div
                        className="absolute rounded-full bg-pink-200"
                        style={{
                          width: '5.5rem',
                          height: '5.5rem',
                          zIndex: -1
                        }}
                      ></div>
                    )}

                    {/* Button container */}
                    <div
                      style={{
                        width: '4.5rem',
                        height: '4.5rem',
                        transform: difficulty === option.value ? 'scale(1.08)' : 'scale(1)',
                        transition: "all 0.3s ease"
                      }}
                      className="flex items-center justify-center"
                    >
                      <button
                        onClick={() => setDifficulty(option.value)}
                        className={`w-full h-full rounded-full flex items-center justify-center text-4xl shadow-md ${difficulty === option.value
                            ? "bg-white border-2 border-pink-400"
                            : "bg-white border border-gray-200 hover:bg-gray-50 hover:border-pink-200"
                          }`}
                        aria-label={`Set difficulty to ${option.label}`}
                      >
                        {option.icon}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom slider - adjusted to match width of icons */}
          <div className="max-w-md mx-auto py-2">
            <style jsx global>{`
              [data-slot="slider-track"] {
                height: 8px !important;
                background: rgba(229, 231, 235, 0.6) !important;
                border-radius: 9999px !important;
              }
              [data-slot="slider-range"] {
                background: linear-gradient(90deg, #EC4899 0%, #8B5CF6 100%) !important;
                border-radius: 9999px !important;
              }
              [data-slot="slider-thumb"] {
                width: 28px !important;
                height: 28px !important;
                background: white !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                border: 2px solid #EC4899 !important;
                transition: transform 0.2s, box-shadow 0.2s !important;
              }
              [data-slot="slider-thumb"]:hover {
                transform: scale(1.1) !important;
                box-shadow: 0 2px 12px rgba(236, 72, 153, 0.3) !important;
              }
            `}</style>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[difficulty]}
              onValueChange={(val) => setDifficulty(getVisibleDifficulty(val[0]))}
              className="w-full cursor-pointer z-20"
            />
          </div>

          {/* Single active label displayed prominently */}
          <div className="flex justify-center mt-5">
            <span className="text-pink-500 font-semibold text-2xl">
              {activeOption.label}
            </span>
          </div>
        </div>

        {/* Difficulty info box */}
        <div className="bg-gradient-to-r from-pink-50 to-violet-50 rounded-2xl p-5 border border-pink-100 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-2 text-xl">
            {difficultyInfo.title}
          </h3>
          <p className="text-gray-700 text-center">
            {difficultyInfo.description}
          </p>
        </div>
      </div>
    </div>
  );
};