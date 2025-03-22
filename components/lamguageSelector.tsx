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
      <SelectTrigger className="w-full rounded-pill bg-[var(--muted)] px-4 py-3 text-[var(--foreground)] shadow-soft">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="bg-[var(--muted)] rounded-2xl">
        {languages.map((lang) => (
          <SelectItem
            key={lang.code}
            value={lang.code}
            className="rounded-xl text-[var(--foreground)] hover:bg-[var(--pastel-blue)]"
          >
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
