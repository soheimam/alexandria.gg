"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/state/appStore";

export const LanguageSelector = () => {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  return (
    <div className="w-full space-y-2">
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger
          className="w-full rounded-2xl border border-gray-200 px-6 py-4 text-base bg-white bg-opacity-60 text-gray-800 hover:bg-opacity-100 transition-all duration-300 shadow-sm"
        >
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent
          className="bg-white rounded-2xl border border-gray-200 text-gray-800 shadow-lg backdrop-blur-sm overflow-hidden"
        >
          {languages.map((lang) => (
            <SelectItem
              key={lang.code}
              value={lang.code}
              className="text-base py-4 px-6 cursor-pointer rounded-xl hover:bg-indigo-50 transition-colors duration-200 focus:bg-indigo-50 m-1"
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
