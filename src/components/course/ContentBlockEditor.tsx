'use client'

import { useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  Video,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Lightbulb,
  ShieldCheck,
  GripVertical,
  Loader2,
  BookOpen,
  Layers,
} from 'lucide-react'
import type { ContentBlock, ContentBlockType, Competency, ScaffoldLayer } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

const BLOCK_TYPE_OPTIONS: { value: ContentBlockType; label: string; icon: ReactNode; hint: string }[] = [
  { value: 'text', label: 'Rich Text', icon: <FileText className="h-4 w-4" />, hint: 'Explanations, theory, examples' },
  { value: 'video', label: 'Video', icon: <Video className="h-4 w-4" />, hint: 'Embed or upload lecture video' },
  { value: 'checkpoint', label: 'Checkpoint', icon: <ShieldCheck className="h-4 w-4" />, hint: 'Quick knowledge check with immediate feedback' },
  { value: 'reflection_prompt', label: 'Reflection', icon: <Lightbulb className="h-4 w-4" />, hint: 'Open-ended reflective writing prompt' },
  { value: 'assignment', label: 'Assignment', icon: <ClipboardCheck className="h-4 w-4" />, hint: 'Structured submission with rubric' },
  { value: 'sandbox', label: 'Sandbox', icon: <Layers className="h-4 w-4" />, hint: 'Code or notation practice environment' },
  { value: 'audio', label: 'Audio', icon: <HelpCircle className="h-4 w-4" />, hint: 'Narration or podcast segment' },
  { value: 'image', label: 'Image / Diagram', icon: <BookOpen className="h-4 w-4" />, hint: 'Visual with optional hotspot tooltips' },
]

const SCAFFOLD_LEVELS: ScaffoldLayer['label'][] = ['core', 'reinforce', 'enrich']

interface ContentBlockEditorProps {
  block: ContentBlock
  competencies: Competency[]
  onUpdate: (id: string, updates: Partial<ContentBlock>) => void
  onDelete: (id: string) => void
  onAddBelow: () => void
  readOnly?: boolean
}

export function ContentBlockEditor({ block, competencies, onUpdate, onDelete, onAddBelow, readOnly = false }: ContentBlockEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showScaffold, setShowScaffold] = useState(block.supportsScaffolding)
  const [showCheckpoint, setShowCheckpoint] = useState(!!block.checkpointConfig)
  const [showReflection, setShowReflection] = useState(!!block.reflectionConfig)

  const blockTypeInfo = BLOCK_TYPE_OPTIONS.find(b => b.value === block.blockType)

  const toggleScaffoldLayer = (label: ScaffoldLayer['label']) => {
    const exists = block.scaffoldLayers.find(l => l.label === label)
    let newLayers: ScaffoldLayer[]
    if (exists) {
      newLayers = block.scaffoldLayers.filter(l => l.label !== label)
    } else {
      newLayers = [...block.scaffoldLayers, { id: `sl-${Date.now()}-${label}`, label, content: '', condition: 'medium' }]
    }
    onUpdate(block.id, { scaffoldLayers: newLayers, supportsScaffolding: newLayers.length > 0 })
  }

  const updateScaffoldLayer = (label: ScaffoldLayer['label'], field: keyof ScaffoldLayer, value: string) => {
    const newLayers = block.scaffoldLayers.map(l => l.label === label ? { ...l, [field]: value } : l)
    onUpdate(block.id, { scaffoldLayers: newLayers })
  }

  return (
    <Card className={cn('transition-colors', block.checkpointConfig ? 'border-blue-200 bg-blue-50/30' : '')}>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 px-4 py-3">
          {!readOnly && <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-800 flex-shrink-0"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <span className="text-gray-400 text-xs font-mono">#{block.order + 1}</span>
          <div className="flex-1 min-w-0">
            <Input
              value={block.title}
              onChange={e => onUpdate(block.id, { title: e.target.value })}
              className={cn(
                'border-0 shadow-none px-0 font-medium text-sm',
                readOnly && 'cursor-default'
              )}
              readOnly={readOnly}
              placeholder="Block title"
            />
          </div>
          {blockTypeInfo && (
            <span className="hidden md:flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
              {blockTypeInfo.icon} {blockTypeInfo.label}
            </span>
          )}
          {block.checkpointConfig && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">
              Checkpoint
            </span>
          )}
          {!readOnly && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddBelow}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => onDelete(block.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
            {!readOnly && (
              <div>
                <Label className="text-xs text-gray-500 mb-1">Block Type</Label>
                <Select value={block.blockType} onValueChange={(v: ContentBlockType) => onUpdate(block.id, { blockType: v })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <div>
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-gray-400">{opt.hint}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-500 mb-1">Content</Label>
              <Textarea
                value={block.content}
                onChange={e => onUpdate(block.id, { content: e.target.value })}
                placeholder="Enter block content (HTML supported for rich text)..."
                rows={4}
                readOnly={readOnly}
                className="text-sm"
              />
            </div>

            {(block.blockType === 'video' || block.blockType === 'audio' || block.blockType === 'image') && (
              <div>
                <Label className="text-xs text-gray-500">Media URL</Label>
                <Input
                  value={block.mediaUrl || ''}
                  onChange={e => onUpdate(block.id, { mediaUrl: e.target.value })}
                  placeholder="https://..."
                  readOnly={readOnly}
                  className="text-sm"
                />
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-500 mb-1">Competency Tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {(block.competencyTags.length === 0 && !readOnly) && (
                  <span className="text-xs text-gray-400 italic">No tags — use the Competencies tab to tag this block</span>
                )}
                {block.competencyTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                    {tag}
                    {!readOnly && (
                      <button onClick={() => onUpdate(block.id, { competencyTags: block.competencyTags.filter(t => t !== tag) })} className="hover:text-red-600">×</button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {!readOnly && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="scaffold"
                      checked={showScaffold}
                      onCheckedChange={(checked) => {
                        setShowScaffold(checked)
                        if (!checked) onUpdate(block.id, { supportsScaffolding: false, scaffoldLayers: [] })
                      }}
                    />
                    <Label htmlFor="scaffold" className="text-xs cursor-pointer">Scaffold Layers</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="checkpoint"
                      checked={showCheckpoint}
                      onCheckedChange={(checked) => {
                        setShowCheckpoint(checked)
                        if (!checked) onUpdate(block.id, { checkpointConfig: undefined })
                        else onUpdate(block.id, { checkpointConfig: {
                          id: `chk-${Date.now()}`,
                          question: '',
                          questionType: 'mc',
                          options: [
                            { id: 'opt-1', text: '', isCorrect: false },
                            { id: 'opt-2', text: '', isCorrect: false },
                            { id: 'opt-3', text: '', isCorrect: false },
                            { id: 'opt-4', text: '', isCorrect: false },
                          ],
                          passageageThreshold: 0.5,
                          masteryThreshold: 80,
                          feedbackCorrect: '',
                          feedbackIncorrect: '',
                          allowRetry: true,
                          maxAttempts: 3,
                          competencyTags: [],
                        }})
                      }}
                    />
                    <Label htmlFor="checkpoint" className="text-xs cursor-pointer">Checkpoint</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="reflection"
                      checked={showReflection}
                      onCheckedChange={(checked) => {
                        setShowReflection(checked)
                        if (!checked) onUpdate(block.id, { reflectionConfig: undefined })
                        else onUpdate(block.id, { reflectionConfig: { prompt: '', minWordCount: 50, allowAnonymous: false } })
                      }}
                    />
                    <Label htmlFor="reflection" className="text-xs cursor-pointer">Reflection</Label>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Min dwell (s)</Label>
                  <Input
                    type="number"
                    value={block.minDwellSeconds}
                    onChange={e => onUpdate(block.id, { minDwellSeconds: parseInt(e.target.value) || 0 })}
                    className="h-7 w-16 text-xs"
                  />
                </div>
              </div>
            )}

            {showScaffold && !readOnly && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-amber-800 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> Scaffold Layers
                </p>
                <p className="text-xs text-amber-600 -mt-1">Enable per-layer content that learners see based on comprehension signals.</p>
                {SCAFFOLD_LEVELS.map(level => {
                  const layer = block.scaffoldLayers.find(l => l.label === level)
                  const levelColors: Record<string, string> = { core: 'blue', reinforce: 'amber', enrich: 'green' }
                  const color = levelColors[level]
                  return (
                    <div key={level} className={cn('border rounded-md p-2', `border-${color}-200 bg-${color}-50/50`)}>
                      <div className="flex items-center gap-2 mb-1">
                        <Switch
                          checked={!!layer}
                          onCheckedChange={() => toggleScaffoldLayer(level)}
                        />
                        <span className="text-xs font-medium capitalize text-gray-700">{level}</span>
                      </div>
                      {layer && (
                        <Textarea
                          value={layer.content}
                          onChange={e => updateScaffoldLayer(level, 'content', e.target.value)}
                          placeholder={`${level} layer content...`}
                          rows={2}
                          className="text-xs"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {showCheckpoint && block.checkpointConfig && !readOnly && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                <p className="text-xs font-medium text-blue-800 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Checkpoint Configuration
                </p>
                <div>
                  <Label className="text-xs text-blue-700">Question</Label>
                  <Input
                    value={block.checkpointConfig.question}
                    onChange={e => onUpdate(block.id, {
                      checkpointConfig: { ...block.checkpointConfig!, question: e.target.value }
                    })}
                    placeholder="Ask a focused question..."
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-blue-700">Passageage</Label>
                    <Input
                      type="number"
                      value={Math.round(block.checkpointConfig.passageageThreshold * 100)}
                      onChange={e => onUpdate(block.id, {
                        checkpointConfig: { ...block.checkpointConfig!, passageageThreshold: parseInt(e.target.value) / 100 }
                      })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-blue-700">Mastery %</Label>
                    <Input
                      type="number"
                      value={block.checkpointConfig.masteryThreshold}
                      onChange={e => onUpdate(block.id, {
                        checkpointConfig: { ...block.checkpointConfig!, masteryThreshold: parseInt(e.target.value) || 0 }
                      })}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-blue-700">Correct Feedback</Label>
                    <Input
                      value={block.checkpointConfig.feedbackCorrect}
                      onChange={e => onUpdate(block.id, {
                        checkpointConfig: { ...block.checkpointConfig!, feedbackCorrect: e.target.value }
                      })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-blue-700">Incorrect Feedback</Label>
                    <Input
                      value={block.checkpointConfig.feedbackIncorrect}
                      onChange={e => onUpdate(block.id, {
                        checkpointConfig: { ...block.checkpointConfig!, feedbackIncorrect: e.target.value }
                      })}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-blue-700">Max Attempts</Label>
                    <Input
                      type="number"
                      value={block.checkpointConfig.maxAttempts}
                      onChange={e => onUpdate(block.id, {
                        checkpointConfig: { ...block.checkpointConfig!, maxAttempts: parseInt(e.target.value) || 1 }
                      })}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <Switch
                      checked={block.checkpointConfig.allowRetry}
                      onCheckedChange={(checked) => onUpdate(block.id, {
                        checkpointConfig: { ...block.checkpointConfig!, allowRetry: checked }
                      })}
                    />
                    <span className="text-xs text-blue-700">Allow retry</span>
                  </div>
                </div>
              </div>
            )}

            {showReflection && block.reflectionConfig && !readOnly && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-3">
                <p className="text-xs font-medium text-purple-800 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" /> Reflection Prompt
                </p>
                <div>
                  <Label className="text-xs text-purple-700">Prompt</Label>
                  <Textarea
                    value={block.reflectionConfig.prompt}
                    onChange={e => onUpdate(block.id, {
                      reflectionConfig: { ...block.reflectionConfig!, prompt: e.target.value }
                    })}
                    placeholder="What connections can you make between this content and your prior experience?"
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-purple-700">Min Word Count</Label>
                    <Input
                      type="number"
                      value={block.reflectionConfig.minWordCount}
                      onChange={e => onUpdate(block.id, {
                        reflectionConfig: { ...block.reflectionConfig!, minWordCount: parseInt(e.target.value) || 0 }
                      })}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <Switch
                      checked={block.reflectionConfig.allowAnonymous}
                      onCheckedChange={(checked) => onUpdate(block.id, {
                        reflectionConfig: { ...block.reflectionConfig!, allowAnonymous: checked }
                      })}
                    />
                    <span className="text-xs text-purple-700">Allow anonymous</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
