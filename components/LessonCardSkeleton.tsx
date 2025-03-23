import { Card, CardContent } from "@/components/ui/card";

export const LessonCardSkeleton = () => {
    return (
        <Card className="bg-white border border-purple-100 rounded-2xl shadow-sm overflow-hidden h-full">
            <div className="h-3 bg-gray-300 animate-pulse w-full"></div>
            <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="h-6 bg-gray-300 animate-pulse rounded w-4/5"></div>
                    <div className="h-8 w-8 bg-gray-300 animate-pulse rounded-full"></div>
                </div>

                <div className="flex gap-2 mt-auto">
                    <div className="h-5 bg-gray-300 animate-pulse rounded-full w-24"></div>
                    <div className="h-5 bg-gray-300 animate-pulse rounded-full w-20"></div>
                </div>
            </CardContent>
        </Card>
    );
}; 