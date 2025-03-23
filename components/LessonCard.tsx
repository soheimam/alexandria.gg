"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Language } from "@11labs/react";
import { Name } from "@coinbase/onchainkit/identity";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { base } from "viem/chains";
import { useAccount } from "wagmi";

interface LessonCardProps {
    id: string;
    topic: string;
    language: string;
    username: string;
    difficulty: number;
    reward?: {
        amount: number;
        currency: string;
    };
    sourceUrl?: string;
    creator?: string;
    paid?: boolean;
    txHash?: string;
    paidAt?: string;
}

export const LessonCard = ({
    id,
    topic,
    username,
    language,
    difficulty,
    reward,
    sourceUrl,
    creator,
    paid,
    txHash,
    paidAt
}: LessonCardProps) => {
    const router = useRouter();
    const { address } = useAccount();
    const { connect, send, isConnected } = useWebSocket(address as `0x${string}`, id);
    const [isLoading, setIsLoading] = useState(false);

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
        if (lowerLang === "en") return "🇬🇧";
        if (lowerLang === "nl") return "🇳🇱";
        if (lowerLang === "de") return "🇩🇪";
        if (lowerLang === "es") return "🇪🇸";
        if (lowerLang === "fr") return "🇫🇷";
        if (lowerLang === "it") return "🇮🇹";
        if (lowerLang === "pt") return "🇵🇹";
        if (lowerLang === "ru") return "🇷🇺";
        if (lowerLang === "ja") return "🇯🇵";
        if (lowerLang === "zh") return "🇨🇳";
        if (lowerLang === "ko") return "🇰🇷";
        if (lowerLang === "ar") return "🇸🇦";
        if (lowerLang === "hi") return "🇮🇳";
        if (lowerLang === "tr") return "🇹🇷";
        if (lowerLang === "pl") return "🇵🇱";
        return "🌍"; // World globe as fallback
    };

    const handleCardClick = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            if (!isConnected) {
                connect();
            }

            send({
                user_id: address as string,
                name: username || address as string,
                id,
                url: sourceUrl || "",
                language: language.toLowerCase() as Language,
                difficulty,
            });

            router.push(`/lesson/${id}`);
        } catch (error) {
            console.error('Error preparing lesson:', error);
            setIsLoading(false);
        }
    };

    // Function to truncate ethereum address
    const truncateAddress = (address: string) => {
        if (address && address.startsWith('0x') && address.length === 42) {
            return `${address.substring(0, 6)}...${address.substring(38)}`;
        }
        return address;
    };

    return (
        <motion.div
            whileHover={{ scale: isLoading ? 1 : 1.03 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className={`cursor-pointer h-full ${isLoading ? 'opacity-70' : ''}`}
            onClick={handleCardClick}
        >
            <Card className="bg-white border border-pink-100 rounded-2xl shadow-sm overflow-hidden h-full transition-shadow hover:shadow-md relative">
                {/* Top accent bar */}
                <div className="h-5 bg-pink-500 w-full relative z-20"></div>

                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-pink-50 z-0"></div>

                {/* Decorative bubbles */}
                <div className="absolute right-0 bottom-0 w-24 h-24 overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute w-10 h-10 rounded-full bg-pink-200 -right-4 -bottom-4"></div>
                    <div className="absolute w-5 h-5 rounded-full bg-pink-300 right-6 bottom-2"></div>
                    <div className="absolute w-3 h-3 rounded-full bg-pink-400 right-2 bottom-8"></div>
                </div>

                <CardContent className="p-6 space-y-4 relative z-10">
                    <div className="flex items-start">
                        <div className="flex-grow pr-3">
                            <h3 className="text-xl font-bold text-pink-800 leading-tight line-clamp-2">{topic}</h3>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 mt-0.5">
                            {sourceUrl && (
                                <a
                                    href={sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center justify-center p-1 rounded-full text-gray-500 hover:text-pink-500 hover:bg-pink-50 transition-all"
                                    aria-label="View source"
                                    title="View source"
                                >
                                    {sourceUrl.includes("youtube.com") || sourceUrl.includes("youtu.be") ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                    ) : sourceUrl.includes("wikipedia.org") ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 2c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8zm-1 3L9 17h2l.5-3h1l.5 3h2l-2-10h-2zm1 2h.2l.6 3h-1.6l.6-3h.2z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" />
                                        </svg>
                                    )}
                                </a>
                            )}
                            <span className="text-2xl flex items-center justify-center" role="img" aria-label={language}>
                                {getLanguageIcon(language)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                            {getDifficultyLabel(difficulty)} ({difficulty}/10)
                        </span>
                        {reward && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {reward.amount} {reward.currency} reward
                            </span>
                        )}
                        {paid && txHash && (
                            <a
                                href={`https://basescan.org/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                title={paidAt ? `Paid on ${new Date(paidAt).toLocaleDateString()}` : "Reward paid"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                                Paid
                            </a>
                        )}
                        {creator && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1">
                                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                                </svg>
                                {creator.startsWith('0x') && creator.length === 42 ? truncateAddress(creator) : <Name address={creator as `0x${string}`} chain={base} />}
                            </span>
                        )}
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center mt-2">
                            <div className="flex space-x-1">
                                <div className="h-1.5 w-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="h-1.5 w-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="h-1.5 w-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}; 