"use client";

import { LessonCard } from "@/components/LessonCard";
import { LessonCardSkeleton } from "@/components/LessonCardSkeleton";
import { Navigation } from "@/components/navigation";
import { WalletConnect } from "@/components/walletConnect";
import { useRecommendedLessons } from "@/hooks/useRecommendedLessons";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function LessonDiscoveryPage() {
    const { address } = useAccount();
    const { lessons, isLoading, isError, refresh } = useRecommendedLessons(address as string, {
        revalidateOnFocus: true,
        refreshInterval: 0,
        limit: 20
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

    const difficultyOptions = [
        { label: 'All Levels', value: null },
        { label: 'Beginner (1-2)', value: 2 },
        { label: 'Easy (3-4)', value: 4 },
        { label: 'Intermediate (5-6)', value: 6 },
        { label: 'Advanced (7-8)', value: 8 },
        { label: 'Expert (9-10)', value: 10 }
    ];

    // Extract unique languages from lessons
    const languages = lessons
        ? Array.from(new Set(lessons.map(item => item.content.language)))
            .filter(Boolean)
            .sort()
        : [];

    // Filter lessons based on search and filters
    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = !searchQuery ||
            lesson.content.topic.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLanguage = !selectedLanguage ||
            lesson.content.language === selectedLanguage;

        const matchesDifficulty = !selectedDifficulty ||
            (selectedDifficulty === 2 && lesson.content.difficulty <= 2) ||
            (selectedDifficulty === 4 && lesson.content.difficulty > 2 && lesson.content.difficulty <= 4) ||
            (selectedDifficulty === 6 && lesson.content.difficulty > 4 && lesson.content.difficulty <= 6) ||
            (selectedDifficulty === 8 && lesson.content.difficulty > 6 && lesson.content.difficulty <= 8) ||
            (selectedDifficulty === 10 && lesson.content.difficulty > 8);

        return matchesSearch && matchesLanguage && matchesDifficulty;
    });

    // Initial fetch on component mount
    useEffect(() => {
        if (address) {
            refresh();
        }
    }, [refresh, address]);

    // If no wallet is connected, show connect wallet UI
    if (!address) {
        return (
            <main className="min-h-screen bg-[#f0e6f5] p-4 md:p-8 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold text-purple-900 mb-6">Connect Your Wallet</h1>
                    <p className="text-gray-700 mb-8">Please connect your wallet to view recommended lessons</p>
                    <div className="flex justify-center">
                        <WalletConnect />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f0e6f5] p-4 md:p-8">
            <Navigation />
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <header className="text-center mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-2">Discover Lessons</h1>
                        <p className="text-lg text-purple-700">Explore lessons created by the community to expand your knowledge</p>
                    </header>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search bar */}
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Search lessons by topic..."
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Language filter */}
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                    Language
                                </label>
                                <select
                                    id="language"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={selectedLanguage || ''}
                                    onChange={(e) => setSelectedLanguage(e.target.value || null)}
                                >
                                    <option value="">All Languages</option>
                                    {languages.map((lang) => (
                                        <option key={lang} value={lang}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty filter */}
                            <div>
                                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                                    Difficulty
                                </label>
                                <select
                                    id="difficulty"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={selectedDifficulty || ''}
                                    onChange={(e) => setSelectedDifficulty(e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    {difficultyOptions.map((option) => (
                                        <option key={option.label} value={option.value || ''}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lessons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            // Loading state
                            Array(6).fill(0).map((_, i) => (
                                <LessonCardSkeleton key={i} />
                            ))
                        ) : isError ? (
                            // Error state
                            <div className="col-span-full text-center p-8">
                                <p className="text-red-600 text-lg mb-4">Failed to load lessons</p>
                                <button
                                    onClick={() => refresh()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredLessons.length === 0 ? (
                            // Empty state
                            <div className="col-span-full text-center p-8">
                                <p className="text-gray-600 text-lg">No lessons match your filters</p>
                                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            // Lessons
                            filteredLessons.map((item) => (
                                <LessonCard
                                    key={item.SK}
                                    id={item.content.id}
                                    topic={item.content.topic}
                                    language={item.content.language}
                                    difficulty={item.content.difficulty}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
