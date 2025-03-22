"use client";

import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/state/appStore";

export const DifficultySlider = () => {
  const difficulty = useAppStore((s) => s.difficulty);
  const setDifficulty = useAppStore((s) => s.setDifficulty);

  const labels = [
    { icon: "🍼", label: "Easy", textColor: "text-gray-500" },
    { icon: "🍎", label: "Medium", textColor: "text-pink-500" },
    { icon: "🤓", label: "Hard", textColor: "text-gray-500" },
  ];

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-black">Select Difficulty</h2>
      
      {/* Icons */}
      <div className="flex justify-between w-full px-2">
        {labels.map((l, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col items-center`}
          >
            <div className={`${idx + 1 === difficulty ? 'bg-pink-100 p-3 rounded-full' : ''}`}>
              <span className="text-2xl">{l.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Slider */}
      <div className="w-full px-2">
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
          className="w-full cursor-pointer"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between w-full px-2">
        {labels.map((l, idx) => (
          <span 
            key={idx} 
            className={`text-sm font-medium ${idx + 1 === difficulty ? 'text-pink-500' : 'text-gray-500'}`}
          >
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
};
