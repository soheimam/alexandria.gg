"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

interface LessonCardProps {
    id: string;
    topic: string;
    language: string;
    difficulty: number;
}

export const LessonCard = ({ id, topic, language, difficulty }: LessonCardProps) => {
    const getDifficultyColor = (level: number) => {
        if (level <= 2) return "bg-green-100 text-green-800";
        if (level <= 4) return "bg-blue-100 text-blue-800";
        if (level <= 6) return "bg-yellow-100 text-yellow-800";
        if (level <= 8) return "bg-orange-100 text-orange-800";
        return "bg-red-100 text-red-800";
    };

    const getDifficultyLabel = (level: number) => {
        if (level <= 2) return "Beginner";
        if (level <= 4) return "Easy";
        if (level <= 6) return "Intermediate";
        if (level <= 8) return "Advanced";
        return "Expert";
    };

    const getLanguageIcon = (lang: string) => {
        const lowerLang = lang.toLowerCase();
        if (lowerLang.includes("python")) return "🐍";
        if (lowerLang.includes("javascript")) return "🟨";
        if (lowerLang.includes("typescript")) return "🔷";
        if (lowerLang.includes("java")) return "☕";
        if (lowerLang.includes("c++") || lowerLang.includes("cpp")) return "⚙️";
        if (lowerLang.includes("ruby")) return "💎";
        if (lowerLang.includes("go")) return "🐹";
        if (lowerLang.includes("rust")) return "🦀";
        return "📘";
    };

    return (
        <Link href={`/lesson/${id}`} passHref>
            <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="cursor-pointer h-full"
            >
                <Card className="bg-white border border-purple-100 rounded-2xl shadow-sm overflow-hidden h-full transition-shadow hover:shadow-md">
                    <div className="h-3 bg-purple-600 w-full"></div>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <h3 className="text-xl font-bold text-purple-900 leading-tight line-clamp-2">{topic}</h3>
                            <span className="text-2xl" role="img" aria-label={language}>
                                {getLanguageIcon(language)}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                                {getDifficultyLabel(difficulty)} ({difficulty}/10)
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {language}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    );
}; 