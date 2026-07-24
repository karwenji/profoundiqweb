'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useToast } from '@/components/dashboard/Toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft,
  BookOpen,
  Save,
  Loader2,
  CheckCircle2,
  Plus,
  ChevronRight,
  ChevronDown,
  Settings,
  Award,
  ShieldCheck,
} from 'lucide-react'
import { ModuleBuilder } from '@/components/course/ModuleBuilder'
import { CompetencyManager } from '@/components/course/CompetencyManager'
import { PathwayCanvas } from '@/components/course/PathwayCanvas'
import { ContentBlockEditor } from '@/components/course/ContentBlockEditor'
import { getModulesWithLessons, getPagesByLesson, getLessonById, createLessonPage, seedCourseWorkflowData } from '@/lib/courseWorkflow'
import {
  getCompetencies,
  createCompetency,
  updateCompetency,
  deleteCompetency,
  getPathwayRules,
  createPathwayRule,
  updatePathwayRule,
  deletePathwayRule,
  getContentBlocks,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  contentBlocks,
  pathwayRules,
  } from '@/lib/courseBuilder'
import type { CourseModule, Lesson, LessonPage, Competency, PathwayRule, ContentBlock, ContentBlockType } from '@/types/courseWorkflow'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function EnhancedCurriculumPage({ params }: { params: { courseId: string } }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [modules, setModules] = useState<(CourseModule & { lessons: (Lesson & { pages: LessonPage[] })[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('curriculum')
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [pathwayRules, setPathwayRules] = useState<PathwayRule[]>([])
  const [saving, setSaving] = useState(false)

  const courseId = params.courseId

  const loadAll = useCallback(async () => {
    seedCourseWorkflowData()
    const mods = getModulesWithLessons(courseId).map(m => ({
      ...m,
      lessons: m.lessons.map(l => ({ ...l, pages: getPagesByLesson(l.id) })),
    }))
    setModules(mods as any)
    if (mods.length > 0 && mods[0].lessons.length > 0 && !activeLessonId) {
      setActiveLessonId(mods[0].lessons[0].id)
    }
    setCompetencies(getCompetencies(courseId))
    setPathwayRules(pathwayRules.filter(p => p.courseId === courseId))
    setLoading(false)
  }, [courseId, activeLessonId])

  useEffect(() => { loadAll() }, [loadAll])

  const activeLesson = modules.flatMap(m => m.lessons).find(l => l.id === activeLessonId)
  const activeLessonBlocks = activeLessonId ? contentBlocks.filter(b => b.lessonId === activeLessonId) : []

  const handleAddBlock = async (blockType: ContentBlockType) => {
    if (!activeLessonId) return
    const lesson = getLessonById(activeLessonId)
    if (!lesson) return
    const block = createContentBlock({
      lessonId: activeLessonId,
      moduleId: lesson.moduleId,
      courseId,
      blockType,
      title: `New ${blockType.replace('_', ' ')} block`,
      content: '',
      competencyTags: [],
      order: activeLessonBlocks.length,
      supportsScaffolding: false,
      scaffoldLayers: [],
      minDwellSeconds: 30,
    })
    loadAll()
    addToast('success', 'Content block added')
  }

  const handleUpdateBlock = (id: string, updates: Partial<ContentBlock>) => {
    updateContentBlock(id, updates)
    loadAll()
  }

  const handleDeleteBlock = (id: string) => {
    deleteContentBlock(id)
    loadAll()
    addToast('success', 'Block removed')
  }

  const handleSaveCurriculum = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    addToast('success', 'Curriculum and blocks saved successfully')
    setSaving(false)
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/instructor/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enhanced Curriculum Builder</h1>
              <p className="text-gray-500 text-sm">Content blocks, competencies, and adaptive pathways</p>
            </div>
          </div>
          <Button onClick={handleSaveCurriculum} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save All</>}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="curriculum" className="gap-2">
              <BookOpen className="h-4 w-4" /> Curriculum
            </TabsTrigger>
            <TabsTrigger value="competencies" className="gap-2">
              <Award className="h-4 w-4" /> Competencies
            </TabsTrigger>
            <TabsTrigger value="pathways" className="gap-2">
              <ShieldCheck className="h-4 w-4" /> Pathways
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium text-gray-500 mb-2 px-1">LESSONS</p>
                    <div className="space-y-0.5">
                      {modules.map(module => (
                        <div key={module.id}>
                          <p className="text-xs font-semibold text-gray-400 px-2 py-1.5 uppercase tracking-wider">{module.title}</p>
                          {module.lessons.map(lesson => (
                            <button
                              key={lesson.id}
                              onClick={() => setActiveLessonId(lesson.id)}
                              className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left',
                                activeLessonId === lesson.id
                                  ? 'bg-primary text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              )}
                            >
                              {activeLessonId === lesson.id ? (
                                <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                              <Badge variant="secondary" className="ml-auto text-xs">{lesson.totalPages}</Badge>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {activeLesson ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{activeLesson.title}</h3>
                        <p className="text-xs text-gray-500">{activeLesson.durationMinutes} min • {activeLesson.contentType} • {activeLesson.xpReward} XP</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select onValueChange={(v: ContentBlockType) => handleAddBlock(v)}>
                          <SelectTrigger className="h-8 w-44 text-xs">
                            <SelectValue placeholder="+ Add block" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">📄 Text</SelectItem>
                            <SelectItem value="video">🎬 Video</SelectItem>
                            <SelectItem value="audio">🔊 Audio</SelectItem>
                            <SelectItem value="image">🖼 Image</SelectItem>
                            <SelectItem value="checkpoint">✅ Checkpoint</SelectItem>
                            <SelectItem value="reflection_prompt">💭 Reflection</SelectItem>
                            <SelectItem value="assignment">📋 Assignment</SelectItem>
                            <SelectItem value="sandbox">🧪 Sandbox</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {activeLessonBlocks.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <Plus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">No content blocks yet. Use the dropdown above to add your first block.</p>
                        <p className="text-xs text-gray-400 mt-1">Each block can include scaffolding layers, competency tags, and checkpoints.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeLessonBlocks.map(block => (
                          <ContentBlockEditor
                            key={block.id}
                            block={block}
                            competencies={competencies}
                            onUpdate={handleUpdateBlock}
                            onDelete={handleDeleteBlock}
                            onAddBelow={() => {
                              const lesson = getLessonById(activeLessonId!)
                              if (!lesson) return
                              createContentBlock({
                                lessonId: activeLessonId!,
                                moduleId: lesson.moduleId,
                                courseId,
                                blockType: 'text',
                                title: 'New block',
                                content: '',
                                competencyTags: [],
                                order: activeLessonBlocks.length,
                                supportsScaffolding: false,
                                scaffoldLayers: [],
                                minDwellSeconds: 30,
                              })
                              loadAll()
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Select a lesson from the sidebar to edit its content blocks.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="competencies">
            <CompetencyManager
              competencies={competencies}
              onCreate={async data => {
                const comp = createCompetency({ courseId, ...data, taxonomyLevel: data.taxonomyLevel as Competency['taxonomyLevel'] })
                setCompetencies([...competencies, comp])
                addToast('success', 'Competency added')
                return comp
              }}
              onUpdate={(id, updates) => {
                updateCompetency(id, updates)
                setCompetencies(competencies.map(c => c.id === id ? { ...c, ...updates } : c))
              }}
              onDelete={id => {
                deleteCompetency(id)
                setCompetencies(competencies.filter(c => c.id !== id))
                addToast('success', 'Competency removed')
              }}
            />
          </TabsContent>

          <TabsContent value="pathways">
            <PathwayCanvas
              rules={pathwayRules}
              onCreateRule={async rule => {
                const newRule = createPathwayRule({ ...rule, courseId })
                setPathwayRules([...pathwayRules, newRule])
                addToast('success', 'Pathway rule created')
                return newRule
              }}
              onUpdateRule={(id, updates) => {
                updatePathwayRule(id, updates)
                setPathwayRules(pathwayRules.map(r => r.id === id ? { ...r, ...updates } : r))
              }}
              onDeleteRule={id => {
                deletePathwayRule(id)
                setPathwayRules(pathwayRules.filter(r => r.id !== id))
              }}
              unitOptions={modules.flatMap(m => [
                { id: m.id, label: `Module: ${m.title}` },
                ...m.lessons.map(l => ({ id: l.id, label: `Lesson: ${l.title}` })),
              ])}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}

export function EnhancedCurriculumWrapper() {
  return (
    <ProtectedRoute permissions={['create_courses', 'edit_own_courses']}>
      <EnhancedCurriculumPage params={{ courseId: '' }} />
    </ProtectedRoute>
  )
}
