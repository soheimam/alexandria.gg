"use client";

import useSWR from 'swr';

// Define the response type based on the actual API response
interface FlashCard {
    question: string;
    answer: string;
    id: string;
}

interface LessonContent {
    difficulty: number;
    flash_cards: FlashCard[];
    agent_system_prompt: string;
    topic: string;
    language: string;
    agent_first_message: string;
    url: string;
}

interface ContentItem {
    content: LessonContent;
    SK: string;
    id: string;
    PK: string;
    status: string;
    paid?: boolean;
    txHash?: string;
    paidAt?: string;
    reward?: string;
}

type ContentResponse = ContentItem[];

interface ErrorResponse {
    message: string;
    status: number;
}

/**
 * Custom hook for fetching user's personal lessons from Alexandria API
 * 
 * @param options - Additional SWR configuration options
 * @returns SWR response with data, error, and loading state
 */
export function usePersonalLessons(
    user_id: string,
    options?: {
        revalidateOnFocus?: boolean,
        refreshInterval?: number,
        limit?: number
    }
) {
    const fetcher = async (url: string): Promise<ContentResponse> => {
        const response = await fetch(url);

        if (!response.ok) {
            const error = new Error('Failed to fetch personal lessons') as Error & {
                status: number;
                info: any;
            };

            error.status = response.status;
            error.info = await response.json().catch(() => ({}));
            throw error;
        }

        return response.json();
    };

    // Use the personal query parameter instead of recommended
    const limit = options?.limit || 10;
    const url = `https://api.alexandria.gg/v1/content?personal=true&limit=${limit}&user_id=${user_id}`;

    const {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    } = useSWR<ContentResponse, ErrorResponse>(
        url,
        fetcher,
        {
            revalidateOnFocus: options?.revalidateOnFocus ?? false,
            refreshInterval: options?.refreshInterval ?? 0,
            suspense: false,
            keepPreviousData: true,
        }
    );

    return {
        lessons: data || [],
        isLoading,
        isValidating,
        isError: !!error,
        error,
        refresh: mutate,
    };
} 