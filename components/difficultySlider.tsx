"use client";

import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/state/appStore";

export const DifficultySlider = () => {
  const difficulty = useAppStore((s) => s.difficulty);
  const setDifficulty = useAppStore((s) => s.setDifficulty);

  const labels = [
    { icon: "🍼", label: "Easy" },
    { icon: "🍎", label: "Medium" },
    { icon: "👨‍🏫", label: "Hard" },
  ];

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Emoji Icons */}
      <div className="flex justify-between w-full px-2">
        {labels.map((l, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-xl">{l.icon}</span>
            <span className="text-xs text-[var(--secondary)]">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Slider */}
      <Slider
        min={1}
        max={3}
        step={1}
        value={[difficulty]}
        onValueChange={(val) => setDifficulty(val[0])}
        className="w-full"
      />

      {/* Selected Label */}
      <div className="text-sm text-[var(--foreground)] font-medium">
        Selected: {labels[difficulty - 1].label}
      </div>
    </div>
  );
};
