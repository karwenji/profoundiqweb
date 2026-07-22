'use client'

import { useState, useEffect, ReactNode, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  Eye,
  BookOpen,
  Clock,
  Video,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import type { CourseModule, Lesson, LessonPage } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

const contentTypeIcons: Record<string, ReactNode> = {
  video: <Video className="h-4 w-4" />,
  text: <FileText className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
  assignment: <ClipboardCheck className="h-4 w-4" />,
  reflection: <Lightbulb className="h-4 w-4" />,
}

interface ModuleBuilderProps {
  courseId: string
  modules: (CourseModule & { lessons: Lesson[] })[]
  onSave?: () => void
  readOnly?: boolean
  className?: string
}

export function ModuleBuilder({ courseId, modules, onSave, readOnly = false, className = '' }: ModuleBuilderProps) {
  const [localModules, setLocalModules] = useState(modules)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.id)))
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const dragItem = useRef<{ type: 'module' | 'lesson'; id: string; index: number } | null>(null)

  useEffect(() => {
    setLocalModules(modules)
  }, [modules])

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addModule = async () => {
    if (readOnly) return
    const newModule: CourseModule = {
      id: `mod-${Date.now()}`,
      courseId,
      title: `Module ${localModules.length + 1}`,
      description: '',
      order: localModules.length + 1,
      unlockRule: 'sequential',
      prerequisites: [],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setLocalModules(prev => [...prev, { ...newModule, lessons: [] }])
    await fetch(`/api/courses/${courseId}/curriculum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_module', data: newModule }),
    })
  }

  const updateModule = async (id: string, updates: Partial<CourseModule>) => {
    if (readOnly) return
    setLocalModules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
    await fetch(`/api/courses/${courseId}/curriculum`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_module', moduleId: id, data: updates }),
    })
  }

  const deleteModule = async (id: string) => {
    if (readOnly) return
    setLocalModules(prev => prev.filter(m => m.id !== id))
    await fetch(`/api/courses/${courseId}/curriculum`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_module', moduleId: id }),
    })
  }

  const addLesson = async (moduleId: string) => {
    if (readOnly) return
    const module = localModules.find(m => m.id === moduleId)
    if (!module) return
    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      moduleId,
      courseId,
      title: `Lesson ${module.lessons.length + 1}`,
      description: '',
      order: module.lessons.length + 1,
      durationMinutes: 10,
      contentType: 'text',
      isFree: false,
      totalPages: 1,
      xpReward: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setLocalModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m))
    await fetch(`/api/courses/${courseId}/curriculum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_lesson', moduleId, data: newLesson }),
    })
  }

  const updateLesson = async (lessonId: string, updates: Partial<Lesson>) => {
    if (readOnly) return
    setLocalModules(prev => prev.map(m => ({ ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l) })))
    await fetch(`/api/courses/${courseId}/curriculum`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_lesson', lessonId, data: updates }),
    })
  }

  const deleteLesson = async (lessonId: string) => {
    if (readOnly) return
    setLocalModules(prev => prev.map(m => ({ ...m, lessons: m.lessons.filter(l => l.id !== lessonId) })))
    await fetch(`/api/courses/${courseId}/curriculum`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_lesson', lessonId }),
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 500))
      onSave?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Course Curriculum</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            {!readOnly && (
              <>
                <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Draft
                </Button>
                <Button size="sm" onClick={addModule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {localModules.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No modules yet. Add your first module to get started.</p>
            </div>
          )}

          {localModules.map((module, moduleIndex) => (
            <div key={module.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-gray-50">
                {!readOnly && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />}
                {expandedModules.has(module.id) ? (
                  <button onClick={() => toggleModule(module.id)} className="text-gray-600">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={() => toggleModule(module.id)} className="text-gray-600">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                {previewMode ? (
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{module.title}</p>
                    <p className="text-xs text-gray-500">{module.lessons.length} lessons</p>
                  </div>
                ) : (
                  <>
                    <Input
                      value={module.title}
                      onChange={(e) => updateModule(module.id, { title: e.target.value })}
                      className="flex-1"
                      placeholder="Module title"
                    />
                    <Select value={module.unlockRule} onValueChange={(value) => updateModule(module.id, { unlockRule: value as 'sequential' | 'all_open' | 'prerequisite' })}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_open">All Open</SelectItem>
                        <SelectItem value="sequential">Sequential</SelectItem>
                        <SelectItem value="prerequisite">Prerequisite</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => deleteModule(module.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </>
                )}
              </div>

              {expandedModules.has(module.id) && (
                <div className="p-4 space-y-3">
                  {!previewMode && (
                    <Textarea
                      value={module.description}
                      onChange={(e) => updateModule(module.id, { description: e.target.value })}
                      placeholder="Module description"
                      className="text-sm"
                    />
                  )}
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        {!readOnly && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab flex-shrink-0" />}
                        <div className="flex-shrink-0">{contentTypeIcons[lesson.contentType] || <FileText className="h-4 w-4 text-gray-400" />}</div>
                        {previewMode ? (
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
                            <p className="text-xs text-gray-500">{lesson.durationMinutes} min • {lesson.totalPages} pages • +{lesson.xpReward} XP</p>
                          </div>
                        ) : (
                          <>
                            <Input
                              value={lesson.title}
                              onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                              className="flex-1"
                              placeholder="Lesson title"
                            />
                            <Input
                              type="number"
                              value={lesson.durationMinutes}
                              onChange={(e) => updateLesson(lesson.id, { durationMinutes: parseInt(e.target.value) || 0 })}
                              className="w-20"
                              placeholder="Min"
                            />
                            <Input
                              type="number"
                              value={lesson.xpReward}
                              onChange={(e) => updateLesson(lesson.id, { xpReward: parseInt(e.target.value) || 0 })}
                              className="w-20"
                              placeholder="XP"
                            />
                            <Select value={lesson.contentType} onValueChange={(value) => updateLesson(lesson.id, { contentType: value as any })}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="assignment">Assignment</SelectItem>
                                <SelectItem value="reflection">Reflection</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                    {!readOnly && (
                      <Button variant="ghost" size="sm" onClick={() => addLesson(module.id)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
