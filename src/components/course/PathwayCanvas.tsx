'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  GitBranch,
  Plus,
  Trash2,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Settings,
} from 'lucide-react'
import type { PathwayRule } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

const PATHWAY_CONDITIONS: { value: string; label: string; hint: string }[] = [
  { value: 'score_below', label: 'Score below threshold', hint: 'Reroute if learner scores < 70%' },
  { value: 'score_above', label: 'Score above threshold', hint: 'Skip remediation if learner scores ≥ 70%' },
  { value: 'confidence_low', label: 'Low confidence', hint: 'Self-reported confidence < 3/5' },
  { value: 'competency_gap', label: 'Competency gap', hint: 'Any mapped competency < 60% mastery' },
  { value: 'time_exceeded', label: 'Time exceeded', hint: 'Time on task exceeds expected' },
]

interface PathwayCanvasProps {
  rules: PathwayRule[]
  onCreateRule: (rule: Omit<PathwayRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateRule: (id: string, updates: Partial<PathwayRule>) => void
  onDeleteRule: (id: string) => void
  unitOptions: { id: string; label: string }[]
  readOnly?: boolean
}

export function PathwayCanvas({
  rules,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  unitOptions,
  readOnly = false,
}: PathwayCanvasProps) {
  const [showNewRule, setShowNewRule] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    conditions: [] as string[],
    sourceUnitId: '',
    sourceUnitType: 'lesson' as 'module' | 'lesson' | 'checkpoint',
    trueBranchId: '',
    falseBranchId: '',
    priority: rules.length,
  })

  const conditionLabels: Record<string, string> = {
    score_below: 'Score < 70%',
    score_above: 'Score ≥ 70%',
    confidence_low: 'Low confidence',
    competency_gap: 'Competency gap',
    time_exceeded: 'Time exceeded',
  }

  const handleCreate = () => {
    if (!newRule.name.trim() || !newRule.sourceUnitId || rules.length >= 10) return
    onCreateRule({
      courseId: rules[0]?.courseId || '',
      name: newRule.name,
      description: newRule.description,
      isActive: true,
      conditions: newRule.conditions as PathwayRule['conditions'],
      sourceUnitId: newRule.sourceUnitId,
      sourceUnitType: newRule.sourceUnitType,
      trueBranchId: newRule.trueBranchId,
      falseBranchId: newRule.falseBranchId,
      priority: newRule.priority,
    })
    setNewRule({
      name: '',
      description: '',
      conditions: [],
      sourceUnitId: '',
      sourceUnitType: 'lesson',
      trueBranchId: '',
      falseBranchId: '',
      priority: rules.length,
    })
    setShowNewRule(false)
  }

  const toggleCondition = (cond: string) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions.includes(cond)
        ? prev.conditions.filter(c => c !== cond)
        : [...prev.conditions, cond],
    }))
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium text-sm">Adaptive Learning Pathways</h3>
              <p className="text-xs text-gray-500">Route learners based on performance signals</p>
            </div>
          </div>
          {!readOnly && (
            <Button size="sm" variant="outline" onClick={() => setShowNewRule(!showNewRule)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Rule
            </Button>
          )}
        </div>

        {!readOnly && showNewRule && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-blue-700">Rule Name</Label>
                <Input value={newRule.name} onChange={e => setNewRule(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Remediation Route" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs text-blue-700">Source Unit</Label>
                <Select value={newRule.sourceUnitId} onValueChange={v => setNewRule(prev => ({ ...prev, sourceUnitId: v }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-blue-700 mb-1">Conditions (any match triggers routing)</Label>
              <div className="flex flex-wrap gap-1.5">
                {PATHWAY_CONDITIONS.map(cond => (
                  <button
                    key={cond.value}
                    type="button"
                    onClick={() => toggleCondition(cond.value)}
                    className={cn(
                      'text-xs px-2 py-1 rounded-full border transition-colors',
                      newRule.conditions.includes(cond.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                    )}
                    title={cond.hint}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> True Branch (path if conditions met)
                </Label>
                <Select value={newRule.trueBranchId} onValueChange={v => setNewRule(prev => ({ ...prev, trueBranchId: v }))}>
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> False Branch (fallback path)
                </Label>
                <Select value={newRule.falseBranchId} onValueChange={v => setNewRule(prev => ({ ...prev, falseBranchId: v }))}>
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowNewRule(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreate} disabled={!newRule.name.trim() || !newRule.sourceUnitId || rules.length >= 10}>
                Add Rule
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {rules.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <GitBranch className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No pathway rules yet. Add rules to create adaptive routes.</p>
              <p className="text-xs text-gray-400 mt-1">Maximum 10 rules per course.</p>
            </div>
          )}
          {rules.map((rule, idx) => (
            <div key={rule.id} className={cn('border rounded-lg p-3', rule.isActive ? 'bg-white' : 'bg-gray-50 opacity-70')}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-0.5 pt-0.5">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                  {idx < rules.length - 1 && <div className="w-0.5 h-4 bg-gray-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900">{rule.name}</p>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => onUpdateRule(rule.id, { isActive: checked })}
                      className="scale-75"
                    />
                    {!readOnly && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-red-500" onClick={() => onDeleteRule(rule.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{rule.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Source: {rule.sourceUnitType} {rule.sourceUnitId}
                    </span>
                    {rule.conditions.map(cond => (
                      <span key={cond} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {conditionLabels[cond] || cond}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> {rule.trueBranchId || 'unset'}
                    </span>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                    <span className="flex items-center gap-1 text-amber-700">
                      <AlertTriangle className="h-3 w-3" /> {rule.falseBranchId || 'unset'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
