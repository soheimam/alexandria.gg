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
    PK: string;
    status: string;
}

type ContentResponse = ContentItem[];

interface ErrorResponse {
    message: string;
    status: number;
}

/**
 * Custom hook for fetching content from Alexandria API
 * 
 * @param contentId - The ID of the content to fetch (optional)
 * @param options - Additional SWR configuration options
 * @returns SWR response with data, error, and loading state
 */
export function useLessonContent(
    userId: string,
    lessonId: string,
    options?: {
        revalidateOnFocus?: boolean,
        refreshInterval?: number
    }
) {
    const fetcher = async (url: string): Promise<ContentResponse> => {
        const response = await fetch(url);

        if (!response.ok) {
            const error = new Error('Failed to fetch content') as Error & {
                status: number;
                info: any;
            };

            error.status = response.status;
            error.info = await response.json().catch(() => ({}));
            throw error;
        }

        return response.json();
    };

    const url = `https://api.alexandria.gg/v1/content?user_id=${userId}&lesson_id=${lessonId}&personal=true`;

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
            suspense: false, // Set to true if you want to use React Suspense
            keepPreviousData: true,
        }
    );

    return {
        content: data && data.length > 0 ? data[0] : null,
        allContent: data,
        isLoading,
        isValidating,
        isError: !!error,
        error,
        refresh: mutate,
    };
}
