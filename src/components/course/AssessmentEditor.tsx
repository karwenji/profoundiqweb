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
  HelpCircle,
  Loader2,
  GripVertical,
  Lightbulb,
  FileText,
} from 'lucide-react'
import type { Assessment, Question, QuestionType } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mc: 'Multiple Choice',
  ma: 'Multiple Answer',
  true_false: 'True / False',
  drag_drop: 'Drag and Drop',
  numeric: 'Numeric / Formula',
  file_upload: 'File Upload',
  video_response: 'Video Response',
  voice_response: 'Voice Response',
}

const QUESTION_TYPE_ICONS: Record<QuestionType, ReactNode> = {
  mc: <HelpCircle className="h-4 w-4" />,
  ma: <HelpCircle className="h-4 w-4" />,
  true_false: <FileText className="h-4 w-4" />,
  drag_drop: <Lightbulb className="h-4 w-4" />,
  numeric: <HelpCircle className="h-4 w-4" />,
  file_upload: <FileText className="h-4 w-4" />,
  video_response: <HelpCircle className="h-4 w-4" />,
  voice_response: <HelpCircle className="h-4 w-4" />,
}

interface AssessmentEditorProps {
  assessment: Assessment
  questions: Question[]
  onUpdateAssessment: (id: string, updates: Partial<Assessment>) => void
  onCreateQuestion: (q: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void
  onDeleteQuestion: (id: string) => void
  readOnly?: boolean
}

export function AssessmentEditor({
  assessment,
  questions,
  onUpdateAssessment,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  readOnly = false,
}: AssessmentEditorProps) {
  const [questionsExpanded, setQuestionsExpanded] = useState(true)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    questionType: 'mc' as QuestionType,
    prompt: '',
    explanation: '',
    difficulty: 0.5,
    options: [
      { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
      { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
      { id: `opt-${Date.now()}-3`, text: '', isCorrect: false },
      { id: `opt-${Date.now()}-4`, text: '', isCorrect: false },
    ],
  })

  const handleCreateQuestion = () => {
    if (!newQuestion.prompt.trim()) return
    onCreateQuestion({
      assessmentId: assessment.id,
      courseId: assessment.courseId,
      questionType: newQuestion.questionType,
      prompt: newQuestion.prompt,
      explanation: newQuestion.explanation,
      difficulty: newQuestion.difficulty,
      options: newQuestion.options,
      competencyTags: [],
    })
    setNewQuestion({
      questionType: 'mc',
      prompt: '',
      explanation: '',
      difficulty: 0.5,
      options: [
        { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
        { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
        { id: `opt-${Date.now()}-3`, text: '', isCorrect: false },
        { id: `opt-${Date.now()}-4`, text: '', isCorrect: false },
      ],
    })
  }

  const toggleOptionCorrectness = (optId: string) => {
    if (newQuestion.questionType === 'ma') {
      setNewQuestion(prev => ({
        ...prev,
        options: prev.options.map(o => o.id === optId ? { ...o, isCorrect: !o.isCorrect } : o),
      }))
    } else {
      setNewQuestion(prev => ({
        ...prev,
        options: prev.options.map(o => ({ ...o, isCorrect: o.id === optId })),
      }))
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium text-sm">{assessment.title}</h3>
              <p className="text-xs text-gray-500">{assessment.type.replace('_', ' ')} • {questions.length} questions</p>
            </div>
          </div>
          {!readOnly && !assessment.isPublished && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateAssessment(assessment.id, { isPublished: true })}
            >
              Publish
            </Button>
          )}
          {assessment.isPublished && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Published</span>
          )}
        </div>

        {!readOnly && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Title</Label>
              <Input
                value={assessment.title}
                onChange={e => onUpdateAssessment(assessment.id, { title: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Mastery Threshold %</Label>
              <Input
                type="number"
                value={assessment.masteryThreshold}
                onChange={e => onUpdateAssessment(assessment.id, { masteryThreshold: parseInt(e.target.value) || 0 })}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Max Attempts</Label>
              <Input
                type="number"
                value={assessment.maxAttempts}
                onChange={e => onUpdateAssessment(assessment.id, { maxAttempts: parseInt(e.target.value) || 1 })}
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-4 pt-5">
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={assessment.isAdaptive}
                  onCheckedChange={(checked) => onUpdateAssessment(assessment.id, { isAdaptive: checked })}
                />
                <span className="text-xs text-gray-600">Adaptive</span>
              </div>
            </div>
          </div>
        )}

        {assessment.isAdaptive && !readOnly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              Adaptive mode active: IRT initial difficulty = {Math.round(assessment.irtStartingDifficulty * 100)}%.
              System adjusts item difficulty after each response. Early-exit when standard error drops below {(assessment.passageageThreshold * 100).toFixed(0)}%.
            </p>
          </div>
        )}

        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setQuestionsExpanded(!questionsExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
          >
            {questionsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Question Bank ({questions.length})
          </button>

          {questionsExpanded && (
            <div className="space-y-2">
              {questions.map(q => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  onUpdate={onUpdateQuestion}
                  onDelete={onDeleteQuestion}
                  readOnly={readOnly}
                  isEditing={editingQuestionId === q.id}
                  onStartEdit={() => setEditingQuestionId(q.id)}
                  onStopEdit={() => setEditingQuestionId(null)}
                />
              ))}

              {!readOnly && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 space-y-3">
                  <p className="text-xs font-medium text-gray-500">Add Question</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">Type</Label>
                      <Select value={newQuestion.questionType} onValueChange={(v: QuestionType) => setNewQuestion(prev => ({ ...prev, questionType: v }))}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(type => (
                            <SelectItem key={type} value={type}>{QUESTION_TYPE_LABELS[type]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Difficulty</Label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={newQuestion.difficulty}
                        onChange={e => setNewQuestion(prev => ({ ...prev, difficulty: parseFloat(e.target.value) || 0.5 }))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Prompt</Label>
                    <Textarea
                      value={newQuestion.prompt}
                      onChange={e => setNewQuestion(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="Enter the question..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  {(newQuestion.questionType === 'mc' || newQuestion.questionType === 'ma') && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500">Options</Label>
                      {newQuestion.options.map((opt, i) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleOptionCorrectness(opt.id)}
                            className={cn(
                              'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center',
                              opt.isCorrect ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            )}
                          >
                            {opt.isCorrect && <span className="text-white text-xs">✓</span>}
                          </button>
                          <Input
                            value={opt.text}
                            onChange={e => setNewQuestion(prev => ({
                              ...prev,
                              options: prev.options.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o),
                            }))}
                            placeholder={`Option ${i + 1}`}
                            className="text-sm h-8"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-400">
                        {newQuestion.questionType === 'mc' ? 'Click circle to mark correct answer' : 'Click to toggle correct answers (multiple allowed)'}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleCreateQuestion}
                      disabled={!newQuestion.prompt.trim()}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QuestionRow({
  question,
  onUpdate,
  onDelete,
  readOnly,
  isEditing,
  onStartEdit,
  onStopEdit,
}: {
  question: Question
  onUpdate: (id: string, updates: Partial<Question>) => void
  onDelete: (id: string) => void
  readOnly: boolean
  isEditing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
}) {
  const [localPrompt, setLocalPrompt] = useState(question.prompt)
  const [localExplanation, setLocalExplanation] = useState(question.explanation)

  if (isEditing) {
    return (
      <div className="border border-blue-300 bg-blue-50 rounded-lg p-3 space-y-2">
        <Textarea value={localPrompt} onChange={e => setLocalPrompt(e.target.value)} rows={2} className="text-sm" placeholder="Question prompt" />
        <Textarea value={localExplanation} onChange={e => setLocalExplanation(e.target.value)} rows={1} className="text-sm" placeholder="Explanation (shown with feedback)" />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onStopEdit}>Cancel</Button>
          <Button size="sm" onClick={() => { onUpdate(question.id, { prompt: localPrompt, explanation: localExplanation }); onStopEdit(); }}>
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 group">
      <div className="flex items-start gap-2">
        {!readOnly && <GripVertical className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {QUESTION_TYPE_LABELS[question.questionType]}
            </span>
            <span className="text-xs text-gray-400">difficulty: {Math.round(question.difficulty * 100)}%</span>
          </div>
          <p className="text-sm text-gray-800 line-clamp-2">{question.prompt}</p>
          {question.explanation && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{question.explanation}</p>}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onStartEdit}>
              <FileText className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(question.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
