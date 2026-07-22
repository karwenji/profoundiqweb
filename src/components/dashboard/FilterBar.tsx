'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  title?: string
  searchPlaceholder?: string
  filters?: ReactNode
  onSearch?: (value: string) => void
  actions?: ReactNode
  className?: string
}

export function FilterBar({
  title,
  searchPlaceholder = 'Search...',
  filters,
  onSearch,
  actions,
  className = '',
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const clearSearch = () => {
    setSearchValue('')
    onSearch?.('')
  }

  return (
    <Card className={cn('mb-6', className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          {title && (
            <div className="md:w-64 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          )}
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 pr-9"
              />
              {searchValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {filters && (
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && 'bg-gray-50')}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            )}
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>
        {filters && showFilters && <div className="mt-4 pt-4 border-t">{filters}</div>}
      </CardContent>
    </Card>
  )
}
