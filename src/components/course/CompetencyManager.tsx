'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Trash2,
  Plus,
  Loader2,
  BookOpen,
  Award,
  Lightbulb,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flame,
} from 'lucide-react'
import type { Competency } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

const BLOOM_LEVELS = [
  { value: 'remember', label: 'Remember', color: 'gray', hint: 'Recall facts and basic concepts' },
  { value: 'understand', label: 'Understand', color: 'blue', hint: 'Explain ideas or concepts' },
  { value: 'apply', label: 'Apply', color: 'green', hint: 'Use information in new situations' },
  { value: 'analyze', label: 'Analyze', color: 'amber', hint: 'Draw connections among ideas' },
  { value: 'evaluate', label: 'Evaluate', color: 'orange', hint: 'Justify a decision or course of action' },
  { value: 'create', label: 'Create', color: 'purple', hint: 'Produce new or original work' },
]

const BLOOM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  remember: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  understand: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  apply: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  analyze: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  evaluate: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  create: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
}

interface CompetencyManagerProps {
  competencies: Competency[]
  onCreate: (data: { code: string; label: string; description: string; taxonomyLevel: string; weight: number; parentId?: string }) => void
  onUpdate: (id: string, updates: Partial<Competency>) => void
  onDelete: (id: string) => void
  learnerMastery?: { competencyId: string; mastery: number; trend: string }[]
  readOnly?: boolean
}

export function CompetencyManager({
  competencies,
  onCreate,
  onUpdate,
  onDelete,
  learnerMastery = [],
  readOnly = false,
}: CompetencyManagerProps) {
  const [newLabel, setNewLabel] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newTaxLevel, setNewTaxLevel] = useState('understand')
  const [newWeight, setNewWeight] = useState(1)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = filterLevel === 'all'
    ? competencies
    : competencies.filter(c => c.taxonomyLevel === filterLevel)

  const masteryMap = new Map(learnerMastery.map(m => [m.competencyId, m]))

  const handleCreate = () => {
    if (!newLabel.trim()) return
    onCreate({
      code: newCode || `C${competencies.length + 1}`,
      label: newLabel,
      description: newDescription,
      taxonomyLevel: newTaxLevel,
      weight: newWeight,
    })
    setNewLabel('')
    setNewCode('')
    setNewDescription('')
    setNewWeight(1)
  }

  const grouped = BLOOM_LEVELS.map(level => ({
    ...level,
    items: filtered.filter(c => c.taxonomyLevel === level.value),
  }))

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-sm">Competency Framework</h3>
            <span className="text-xs text-gray-400">({competencies.length} competencies)</span>
          </div>
          {!readOnly && (
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Filter level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {BLOOM_LEVELS.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {learnerMastery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {competencies.slice(0, 4).map(comp => {
              const mastery = masteryMap.get(comp.id)
              const score = mastery?.mastery ?? 0
              const trend = mastery?.trend || 'stable'
              return (
                <div key={comp.id} className="border rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 truncate">{comp.label}</p>
                  <p className={cn('text-lg font-bold', score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600')}>
                    {Math.round(score)}%
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    {trend === 'improving' && <TrendIcon trend="up" />}
                    {trend === 'declining' && <TrendIcon trend="down" />}
                    {trend === 'stable' && <span>→</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!readOnly && (
          <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-gray-600">Add Competency</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Code</Label>
                <Input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g. C1" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Label</Label>
                <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Data Analysis" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Level</Label>
                <Select value={newTaxLevel} onValueChange={setNewTaxLevel}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOM_LEVELS.map(l => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Weight</Label>
                <Input type="number" min="0.1" step="0.1" value={newWeight} onChange={e => setNewWeight(parseFloat(e.target.value) || 1)} className="h-8 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Description</Label>
              <Textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Describe what mastery looks like..." rows={1} className="text-sm" />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCreate} disabled={!newLabel.trim()}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Competency
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {BLOOM_LEVELS.map(level => {
            if (grouped.find(g => g.value === level.value)?.items.length === 0) return null
            const colors = BLOOM_COLORS[level.value]
            return (
              <div key={level.value} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
                    {level.label}
                  </span>
                  <span className="text-xs text-gray-400">{level.hint}</span>
                </div>
                {filtered.filter(c => c.taxonomyLevel === level.value).map(comp => {
                  const mastery = masteryMap.get(comp.id)
                  const score = mastery?.mastery ?? null
                  return (
                    <div key={comp.id} className={cn('border rounded-lg p-3 flex items-start gap-3', readOnly ? '' : 'hover:bg-gray-50')}>
                      {!readOnly && (
                        <button
                          onClick={() => onDelete(comp.id)}
                          className="text-gray-300 hover:text-red-500 mt-0.5 flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400">{comp.code}</span>
                          <p className="text-sm font-medium text-gray-900">{comp.label}</p>
                          <span className="text-xs text-gray-400">w:{comp.weight}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{comp.description}</p>
                        {score !== null && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-8 text-right">{Math.round(score)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No competencies yet. Add competencies aligned to your learning objectives.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <Flame className="h-3 w-3 text-green-500" />
  if (trend === 'down') return <AlertTriangle className="h-3 w-3 text-red-500" />
  return <span className="text-gray-400">→</span>
}
