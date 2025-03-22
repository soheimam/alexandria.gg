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
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-full bg-white rounded-[32px] px-6 py-4 text-base border-0">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="bg-white rounded-[24px] border-0 shadow-lg">
        {languages.map((lang) => (
          <SelectItem
            key={lang.code}
            value={lang.code}
            className="text-base py-3 px-6 cursor-pointer rounded-[20px] hover:bg-gray-50"
          >
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
