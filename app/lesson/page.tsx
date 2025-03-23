"use client";

import { LessonCard } from "@/components/LessonCard";
import { LessonCardSkeleton } from "@/components/LessonCardSkeleton";
import { Navigation } from "@/components/navigation";
import { WalletConnect } from "@/components/walletConnect";
import { usePersonalLessons } from "@/hooks/usePersonalLessons";
import { useRecommendedLessons } from "@/hooks/useRecommendedLessons";
import { useName } from "@coinbase/onchainkit/identity";
import { useEffect, useState } from "react";
import { base } from "viem/chains";
import { useAccount } from "wagmi";

export default function LessonDiscoveryPage() {
    const { address } = useAccount();
    const { data: name } = useName({ address: address as `0x${string}`, chain: base });

    // State to track current view (recommended or personal)
    const [viewMode, setViewMode] = useState<'recommended' | 'personal'>('recommended');

    // Fetch recommended lessons
    const {
        lessons: recommendedLessons,
        isLoading: isLoadingRecommended,
        isError: isErrorRecommended,
        refresh: refreshRecommended
    } = useRecommendedLessons(address as string, {
        revalidateOnFocus: false,
        refreshInterval: 0,
        limit: 20
    });

    // Fetch personal lessons
    const {
        lessons: personalLessons,
        isLoading: isLoadingPersonal,
        isError: isErrorPersonal,
        refresh: refreshPersonal
    } = usePersonalLessons(address as string, {
        revalidateOnFocus: false,
        refreshInterval: 0,
        limit: 20
    });

    // Use the appropriate data based on view mode
    const lessons = viewMode === 'recommended' ? recommendedLessons : personalLessons;
    const isLoading = viewMode === 'recommended' ? isLoadingRecommended : isLoadingPersonal;
    const isError = viewMode === 'recommended' ? isErrorRecommended : isErrorPersonal;
    const refresh = viewMode === 'recommended' ? refreshRecommended : refreshPersonal;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

    // Store initial order of lessons
    const [initialOrder, setInitialOrder] = useState<string[]>([]);

    useEffect(() => {
        if (lessons && lessons.length && initialOrder.length === 0) {
            // Store initial order by lesson IDs 
            setInitialOrder(lessons.map(lesson => lesson.id));
        }
    }, [lessons, initialOrder.length]);

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

    // Filter lessons based on search and filters, maintain stable order
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
    }).sort((a, b) => {
        // Sort based on initial order to maintain consistency
        if (initialOrder.length) {
            return initialOrder.indexOf(a.id) - initialOrder.indexOf(b.id);
        }
        return 0;
    });

    // Initial fetch on component mount - only fetch once
    useEffect(() => {
        if (address) {
            if (viewMode === 'recommended' && recommendedLessons.length === 0) {
                refreshRecommended();
            } else if (viewMode === 'personal' && personalLessons.length === 0) {
                refreshPersonal();
            }
        }
    }, [address, viewMode]);

    // If no wallet is connected, show connect wallet UI
    if (!address) {
        return (
            <main className="min-h-screen bg-[#f0e6f5] p-4 md:p-8 flex flex-col items-center justify-center">
                <div className="relative bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-[24px] shadow-lg max-w-md w-full text-center border border-pink-100 overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-pink-50 z-0"></div>

                    {/* Decorative bubbles */}
                    <div className="absolute right-0 bottom-0 w-24 h-24 overflow-hidden pointer-events-none opacity-30 z-0">
                        <div className="absolute w-10 h-10 rounded-full bg-pink-200 -right-4 -bottom-4"></div>
                        <div className="absolute w-5 h-5 rounded-full bg-pink-300 right-6 bottom-2"></div>
                        <div className="absolute w-3 h-3 rounded-full bg-pink-400 right-2 bottom-8"></div>
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-pink-800 mb-6">Connect Your Wallet</h1>
                        <p className="text-pink-600 mb-8">Please connect your wallet to view recommended lessons</p>
                        <div className="flex justify-center">
                            <WalletConnect />
                        </div>
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
                    <header className="relative z-10 w-full max-w-3xl mx-auto mb-6">
                        <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-[24px] p-6 border border-pink-100 shadow-lg text-center relative overflow-hidden">
                            {/* Subtle background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-pink-50 z-0"></div>

                            {/* Decorative bubbles */}
                            <div className="absolute right-0 bottom-0 w-24 h-24 overflow-hidden pointer-events-none opacity-30 z-0">
                                <div className="absolute w-10 h-10 rounded-full bg-pink-200 -right-4 -bottom-4"></div>
                                <div className="absolute w-5 h-5 rounded-full bg-pink-300 right-6 bottom-2"></div>
                                <div className="absolute w-3 h-3 rounded-full bg-pink-400 right-2 bottom-8"></div>
                            </div>

                            <div className="relative z-10">
                                <h1 className="text-3xl md:text-4xl font-bold text-pink-800 mb-3">Discover Lessons</h1>
                                <p className="text-lg text-pink-600">Explore lessons created by the community to expand your knowledge</p>
                            </div>
                        </div>
                    </header>

                    {/* View Mode Switcher */}
                    <div className="w-full max-w-3xl mx-auto mb-4">
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-2 shadow-md flex">
                            <button
                                onClick={() => setViewMode('recommended')}
                                className={`flex-1 py-2 px-4 rounded-xl transition-all ${viewMode === 'recommended'
                                    ? 'bg-pink-500 text-white font-medium shadow-sm'
                                    : 'text-pink-700 hover:bg-pink-50'
                                    }`}
                            >
                                Recommended
                            </button>
                            <button
                                onClick={() => setViewMode('personal')}
                                className={`flex-1 py-2 px-4 rounded-xl transition-all ${viewMode === 'personal'
                                    ? 'bg-pink-500 text-white font-medium shadow-sm'
                                    : 'text-pink-700 hover:bg-pink-50'
                                    }`}
                            >
                                My Lessons
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm p-5 rounded-2xl shadow-md mb-6 border border-pink-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search bar */}
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-pink-700 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Search lessons by topic..."
                                    className="w-full p-2 border border-pink-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Language filter */}
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-pink-700 mb-1">
                                    Language
                                </label>
                                <select
                                    id="language"
                                    className="w-full p-2 border border-pink-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                <label htmlFor="difficulty" className="block text-sm font-medium text-pink-700 mb-1">
                                    Difficulty
                                </label>
                                <select
                                    id="difficulty"
                                    className="w-full p-2 border border-pink-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredLessons.length === 0 ? (
                            // Empty state for each view mode
                            <div className="col-span-full text-center p-8">
                                {viewMode === 'personal' ? (
                                    <>
                                        <p className="text-gray-600 text-lg">You haven&apos;t created any lessons yet</p>
                                        <p className="text-gray-500 mt-2">Create your first lesson to see it here!</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-600 text-lg">No lessons match your filters</p>
                                        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            // Lessons
                            filteredLessons.map((item) => {
                                // Extract creator address from SK
                                // Format: "USER#0x7cd70b1cC6d17F750ec8bb62047DB75a67B951db#68236cba"
                                const creatorAddress = item.SK ?
                                    item.SK.split('#')[1] : undefined;

                                return (
                                    <LessonCard
                                        key={item.SK}
                                        sourceUrl={item.content.url}
                                        username={name || address as string}
                                        id={item.id}
                                        topic={item.content.topic}
                                        language={item.content.language}
                                        difficulty={item.content.difficulty}
                                        creator={creatorAddress}
                                        paid={item.paid}
                                        txHash={item.txHash}
                                        paidAt={item.paidAt}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
