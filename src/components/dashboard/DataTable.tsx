'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp, ArrowUpDown, Plus, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | null

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyState?: ReactNode
  loading?: boolean
  actions?: (item: T) => ReactNode
  bulkActions?: ReactNode
  selectedIds?: string[]
  onSelectAll?: () => void
  onSelectNone?: () => void
  className?: string
}

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ChevronUp className="h-4 w-4" />
  if (direction === 'desc') return <ChevronDown className="h-4 w-4" />
  return <ArrowUpDown className="h-4 w-4 opacity-30" />
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyState,
  loading = false,
  actions,
  bulkActions,
  selectedIds = [],
  onSelectAll,
  onSelectNone,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'))
      if (sortDir === 'desc') setSortKey(null)
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0
    const aVal = (a as Record<string, unknown>)[sortKey]
    const bVal = (b as Record<string, unknown>)[sortKey]
    if (aVal === bVal) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    const cmp = aVal < bVal ? -1 : 1
    return sortDir === 'asc' ? cmp : -cmp
  })

  const allSelected = data.length > 0 && selectedIds.length === data.length
  const someSelected = selectedIds.length > 0 && !allSelected

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0 && emptyState) {
    return <Card className={className}>{emptyState}</Card>
  }

  return (
    <Card className={className}>
      {(bulkActions || (selectedIds.length > 0 && onSelectAll)) && (
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected
              }}
              onChange={allSelected ? onSelectNone : onSelectAll}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
          </div>
          {bulkActions}
        </div>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {bulkActions && <th className="w-10 p-4" />}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn('text-left py-3 px-4 font-semibold text-sm text-gray-700', col.className)}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        {col.header}
                        <SortIcon direction={sortKey === col.key ? sortDir : null} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
                {actions && <th className="w-16 p-4" />}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => {
                const id = keyExtractor(item)
                const isSelected = selectedIds.includes(id)
                return (
                  <tr
                    key={id}
                    className={cn(
                      'border-b last:border-b-0 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-gray-50',
                      isSelected && 'bg-primary/5'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {bulkActions && (
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={cn('py-3 px-4 text-sm', col.className)}>
                        {col.render
                          ? col.render(item)
                          : (item as Record<string, unknown>)[col.key]?.toString() ?? ''}
                      </td>
                    ))}
                    {actions && (
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">{actions(item)}</div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
