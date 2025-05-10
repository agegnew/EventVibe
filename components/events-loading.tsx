import { GlassmorphicCard } from "@/components/ui-elements/glassmorphic-card"

export function EventsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <GlassmorphicCard key={index} className="overflow-hidden h-full">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 w-3/4" />
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </GlassmorphicCard>
      ))}
    </div>
  )
}
