import { Card, CardContent } from '@/components/ui/card'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className || ''}`} />
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1 mr-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
          <SkeletonBlock className="h-12 w-12 rounded-lg flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonTable() {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4">
        <SkeletonBlock className="h-4 flex-1" />
        <SkeletonBlock className="h-4 flex-1" />
        <SkeletonBlock className="h-4 flex-1" />
        <SkeletonBlock className="h-4 flex-1" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <SkeletonBlock className="h-10 flex-1" />
          <SkeletonBlock className="h-10 flex-1" />
          <SkeletonBlock className="h-10 flex-1" />
          <SkeletonBlock className="h-10 flex-1" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-64" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <Card>
        <CardContent className="pt-6">
          <SkeletonTable />
        </CardContent>
      </Card>
    </div>
  )
}
