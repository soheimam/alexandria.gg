"use client";

import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/state/appStore";

export const DifficultySlider = () => {
  const difficulty = useAppStore((s) => s.difficulty);
  const setDifficulty = useAppStore((s) => s.setDifficulty);

  const labels = [
    { icon: "🍼", label: "Easy", bgColor: "bg-green-100", textColor: "text-green-600", sliderColor: "bg-green-500" },
    { icon: "🍎", label: "Medium", bgColor: "bg-orange-100", textColor: "text-orange-600", sliderColor: "bg-orange-500" },
    { icon: "👨‍🏫", label: "Hard", bgColor: "bg-red-100", textColor: "text-red-600", sliderColor: "bg-red-500" },
  ];

  return (
    <div className="flex flex-col items-center space-y-6 w-full p-6 bg-white rounded-2xl shadow-sm">
      {/* Emoji Icons */}
      <div className="flex justify-between w-full px-4">
        {labels.map((l, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col items-center ${idx + 1 === difficulty ? 'scale-110 transform transition-transform' : ''}`}
          >
            <div className={`p-3 ${l.bgColor} rounded-full mb-2 ${idx + 1 === difficulty ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}>
              <span className="text-2xl">{l.icon}</span>
            </div>
            <span className={`text-sm font-medium ${l.textColor}`}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Slider */}
      <div className="w-full px-4">
        <style jsx global>{`
          [data-slot="slider-track"] {
            height: 8px !important;
            background: #e5e7eb !important;
            border-radius: 9999px !important;
          }
          [data-slot="slider-range"] {
            background: ${labels[difficulty - 1].sliderColor} !important;
          }
          [data-slot="slider-thumb"] {
            width: 24px !important;
            height: 24px !important;
            background: white !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            border: 2px solid ${labels[difficulty - 1].sliderColor} !important;
          }
          [data-slot="slider-thumb"]:hover {
            transform: scale(1.1);
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

      {/* Selected Label */}
      <div className={`text-sm px-4 py-2 rounded-full font-medium ${labels[difficulty - 1].bgColor} ${labels[difficulty - 1].textColor}`}>
        Currently: {labels[difficulty - 1].label}
      </div>
    </div>
  );
};
