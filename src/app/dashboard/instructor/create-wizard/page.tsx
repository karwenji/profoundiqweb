'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useToast } from '@/components/dashboard/Toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  BookOpen,
  Award,
  HelpCircle,
  GitBranch,
  Eye,
  Sparkles,
  Target,
  ShieldCheck,
  FileText,
  Plus,
} from 'lucide-react'
import { ModuleBuilder } from '@/components/course/ModuleBuilder'
import { StepIndicator, WizardStep } from '@/components/course/WizardStep'
import { CompetencyManager } from '@/components/course/CompetencyManager'
import { AssessmentEditor } from '@/components/course/AssessmentEditor'
import { PathwayCanvas } from '@/components/course/PathwayCanvas'
import {
  createCourseModule,
  getModulesWithLessons,
  createLesson,
  createLessonPage,
  seedCourseWorkflowData,
  getLessonById,
  getLessonsByModule,
  getPagesByLesson,
} from '@/lib/courseWorkflow'
import {
  createCompetency,
  updateCompetency,
  deleteCompetency,
  createAssessment,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateAssessment,
  getAssessments,
  getQuestions,
  createPathwayRule,
  updatePathwayRule,
  deletePathwayRule,
  getPathwayRules,
  createContentBlock,
  getContentBlocks,
  competencies,
  assessments,
  questions,
  pathwayRules,
  contentBlocks,
} from '@/lib/courseBuilder'
import type { CourseModule, Lesson, LessonPage, Assessment, Question, Competency, PathwayRule, ContentBlock, ContentBlockType } from '@/types/courseWorkflow'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Frame', icon: <FileText className="h-4 w-4" />, description: 'Course metadata & objectives' },
  { label: 'Structure', icon: <BookOpen className="h-4 w-4" />, description: 'Modules, lessons & content blocks' },
  { label: 'Competencies', icon: <Award className="h-4 w-4" />, description: 'Learning objectives & tagging' },
  { label: 'Assess', icon: <HelpCircle className="h-4 w-4" />, description: 'Adaptive assessment design' },
  { label: 'Pathways', icon: <GitBranch className="h-4 w-4" />, description: 'Branching rules & remediation' },
  { label: 'Review', icon: <Eye className="h-4 w-4" />, description: 'Preview & publish' },
]

const CATEGORIES = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'design', label: 'Design' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'personal-dev', label: 'Personal Development' },
]

const LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
]

interface CourseWizardState {
  title: string
  description: string
  shortDescription: string
  category: string
  level: string
  price: string
  duration: string
  learningObjectives: string[]
  targetAudience: string
  estimatedHours: string
  courseId: string | null
  modules: (CourseModule & { lessons: (Lesson & { pages: LessonPage[] })[] })[]
  competencies: Competency[]
  assessments: Assessment[]
  pathwayRules: PathwayRule[]
  contentBlocks: ContentBlock[]
}

const initialFormState: CourseWizardState = {
  title: '',
  description: '',
  shortDescription: '',
  category: '',
  level: 'Beginner',
  price: '',
  duration: '',
  learningObjectives: [''],
  targetAudience: '',
  estimatedHours: '',
  courseId: null,
  modules: [],
  competencies: [],
  assessments: [],
  pathwayRules: [],
  contentBlocks: [],
}

export default function CourseCreationWizardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CourseWizardState>(initialFormState)
  const modulesRef = useRef(form.modules)
  modulesRef.current = form.modules
  const courseIdRef = useRef(form.courseId)
  courseIdRef.current = form.courseId

  const updateForm = (partial: Partial<CourseWizardState>) => {
    setForm(prev => {
      const next = { ...prev, ...partial }
      if (partial.modules) modulesRef.current = partial.modules
      if (partial.courseId) courseIdRef.current = partial.courseId
      return next
    })
  }

  const refreshModules = useCallback((courseId: string) => {
    const modules = getModulesWithLessons(courseId).map(m => ({
      ...m,
      lessons: m.lessons.map(l => ({ ...l, pages: getPagesByLesson(l.id) })),
    }))
    updateForm({ modules: modules as any })
  }, [])

  const refreshCompetencies = useCallback(() => {
    if (!courseIdRef.current) return
    updateForm({ competencies: competencies.filter(c => c.courseId === courseIdRef.current) })
  }, [])

  const refreshAssessments = useCallback(() => {
    if (!courseIdRef.current) return
    updateForm({ assessments: assessments.filter(a => a.courseId === courseIdRef.current) })
  }, [])

  const refreshPathways = useCallback(() => {
    if (!courseIdRef.current) return
    updateForm({ pathwayRules: pathwayRules.filter(p => p.courseId === courseIdRef.current) })
  }, [])

  const refreshContentBlocks = useCallback(() => {
    if (!courseIdRef.current) return
    const courseModules = getModulesWithLessons(courseIdRef.current).map(m => ({
      ...m,
      lessons: m.lessons.map(l => ({ ...l, pages: getPagesByLesson(l.id) })),
    }))
    const allLessonIds = courseModules.flatMap(m => m.lessons.map(l => l.id))
    const blocks = allLessonIds.flatMap(lessonId => contentBlocks.filter(b => b.lessonId === lessonId))
    updateForm({ modules: courseModules as any, contentBlocks: blocks })
  }, [])

  const handleCreateCourse = async (): Promise<string | null> => {
    setSaving(true)
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          instructor: user?.name || '',
          instructor_id: user?.id,
          category: form.category,
          price: parseFloat(form.price) || 0,
          duration: form.duration || '4 weeks',
          lessons: 1,
          image: '/course-placeholder.png',
          status: 'draft',
          adminSplit: 40,
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Failed to create course')
      updateForm({ courseId: result.data.id })
      return result.data.id
    } finally {
      setSaving(false)
    }
  }

  const handleCreateFirstModule = useCallback(async (courseId: string) => {
    seedCourseWorkflowData()
    const module = createCourseModule({
      courseId,
      title: 'Module 1: Getting Started',
      description: 'Foundation content for this course.',
      order: 1,
      unlockRule: 'all_open',
      prerequisites: [],
      isPublished: true,
    })
    const estimatedMinutes = parseInt(form.estimatedHours) * 60 || 60
    const lesson = createLesson({
      moduleId: module.id,
      courseId,
      title: 'Course Introduction',
      description: 'Overview and learning objectives.',
      order: 1,
      durationMinutes: estimatedMinutes,
      contentType: 'text',
      isFree: true,
      totalPages: 1,
      xpReward: 20,
    })
    createLessonPage({
      lessonId: lesson.id,
      moduleId: module.id,
      courseId,
      pageNumber: 1,
      content: `<p>Welcome to <strong>${form.title}</strong>. This lesson introduces the course structure and learning path.</p>`,
      contentType: 'text',
      minDwellSeconds: 30,
    })
    return module
  }, [form.title, form.estimatedHours])

  const validateStep1 = (): boolean => {
    if (!form.title.trim()) { addToast('error', 'Course title is required'); return false }
    if (!form.category) { addToast('error', 'Please select a category'); return false }
    return true
  }

  const handleNext = async (): Promise<boolean> => {
    if (step === 1) {
      if (!validateStep1()) return false
      if (!form.courseId) {
        const courseId = await handleCreateCourse()
        if (!courseId) { addToast('error', 'Failed to create course'); return false }
        await handleCreateFirstModule(courseId)
        refreshModules(courseId)
        addToast('success', 'Course created! Now design your curriculum.')
      }
    }
    setStep(s => Math.min(s + 1, STEPS.length))
    return true
  }

  const handleBack = () => setStep(s => Math.max(s - 1, 1))

  const handlePublish = async () => {
    if (!form.courseId) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    addToast('success', 'Course published! Redirecting...')
    setTimeout(() => router.push('/dashboard/instructor/courses'), 1000)
    setSaving(false)
  }

  const handleCompetencyCreate = useCallback((data: { code: string; label: string; description: string; taxonomyLevel: string; weight: number; parentId?: string }) => {
    if (!form.courseId) return
    const comp = createCompetency({ courseId: form.courseId, ...data, taxonomyLevel: data.taxonomyLevel as Competency['taxonomyLevel'] })
    updateForm({ competencies: [...form.competencies, comp] })
    return comp
  }, [form.courseId, form.competencies])

  const handleCompetencyUpdate = useCallback((id: string, updates: Partial<Competency>) => {
    updateCompetency(id, updates)
    updateForm({ competencies: form.competencies.map(c => c.id === id ? { ...c, ...updates } : c) })
  }, [form.competencies])

  const handleCompetencyDelete = useCallback((id: string) => {
    deleteCompetency(id)
    updateForm({ competencies: form.competencies.filter(c => c.id !== id) })
  }, [form.competencies])

  const handleAssessmentCreate = useCallback(async (data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!form.courseId) return
    const { courseId: _cid, ...rest } = data
    const assessment = createAssessment({ courseId: form.courseId, ...rest })
    refreshAssessments()
    return assessment
  }, [form.courseId, refreshAssessments])

  const handleCreateQuestion = useCallback((q: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createQuestion(q)
  }, [])

  const handleQuestionUpdate = useCallback((id: string, updates: Partial<Question>) => {
    updateQuestion(id, updates)
  }, [])

  const handleQuestionDelete = useCallback((id: string) => {
    deleteQuestion(id)
  }, [])

  const handlePathwayCreate = useCallback((rule: Omit<PathwayRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!form.courseId) return
    const { courseId: _cid, ...rest } = rule
    const newRule = createPathwayRule({ courseId: form.courseId, ...rest })
    refreshPathways()
    return newRule
  }, [form.courseId, refreshPathways])

  const handlePathwayUpdate = useCallback((id: string, updates: Partial<PathwayRule>) => {
    updatePathwayRule(id, updates)
    refreshPathways()
  }, [refreshPathways])

  const handlePathwayDelete = useCallback((id: string) => {
    deletePathwayRule(id)
    refreshPathways()
  }, [refreshPathways])

  useEffect(() => {
    if (step === 3) refreshCompetencies()
    if (step === 4) refreshAssessments()
    if (step === 5) refreshPathways()
  }, [step, refreshCompetencies, refreshAssessments, refreshPathways])

  const moduleCount = form.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const competencyCount = form.competencies.length
  const pathwayCount = pathwayRules.filter(r => r.courseId === form.courseId && r.isActive).length
  const assessmentList = form.courseId ? assessments.filter(a => a.courseId === form.courseId) : []
  const questionCount = questions.filter(q => assessmentList.some(a => a.id === q.assessmentId)).length

  const unitOptions = form.modules.flatMap(m => [
    { id: m.id, label: `Module: ${m.title}` },
    ...m.lessons.map(l => ({ id: l.id, label: `Lesson: ${l.title}` })),
  ])

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/instructor/courses')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-gray-500 text-sm">{form.title || 'Untitled Course'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" /> {STEPS[step - 1]?.label}
            </Badge>
          </div>
        </div>

        <Progress value={(step / STEPS.length) * 100} className="mb-8" />

        <StepIndicator currentStep={step} steps={STEPS} />

        <form onSubmit={e => e.preventDefault()}>
          <WizardStep
            step={1}
            currentStep={step}
            title="Frame Your Course"
            description="Define the scope, audience, and learning objectives for your course."
            icon={<FileText className="h-5 w-5" />}
            onNext={handleNext}
            onBack={handleBack}
          >
            <div className="space-y-5">
              <div>
                <Label>Course Title <span className="text-red-500">*</span></Label>
                <Input
                  value={form.title}
                  onChange={e => updateForm({ title: e.target.value })}
                  placeholder="e.g. Advanced Data Visualization for Business Intelligence"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Short Description</Label>
                <Textarea
                  value={form.shortDescription}
                  onChange={e => updateForm({ shortDescription: e.target.value })}
                  placeholder="One-paragraph summary shown on course cards..."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => updateForm({ category: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={v => updateForm({ level: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Price (USD)</Label>
                  <Input type="number" value={form.price} onChange={e => updateForm({ price: e.target.value })} placeholder="0.00" className="mt-1" />
                </div>
                <div>
                  <Label>Estimated Study Hours</Label>
                  <Input type="number" value={form.estimatedHours} onChange={e => updateForm({ estimatedHours: e.target.value })} placeholder="e.g. 40" className="mt-1" />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input value={form.duration} onChange={e => updateForm({ duration: e.target.value })} placeholder="e.g. 6 weeks" className="mt-1" />
                </div>
              </div>

              <div>
                <Label>Full Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => updateForm({ description: e.target.value })}
                  placeholder="Course overview, what learners will achieve, prerequisites..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Learning Objectives (one per line)</Label>
                <Textarea
                  value={form.learningObjectives.join('\n')}
                  onChange={e => updateForm({ learningObjectives: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="Analyze data sets using statistical methods\nBuild interactive dashboards with modern tools\nCommunicate insights to non-technical stakeholders"
                  rows={4}
                  className="mt-1"
                />
                {form.learningObjectives.filter(Boolean).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.learningObjectives.filter(Boolean).map((obj, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Target className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-gray-700">{obj}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <Label>Target Audience</Label>
                <Textarea
                  value={form.targetAudience}
                  onChange={e => updateForm({ targetAudience: e.target.value })}
                  placeholder="e.g. Mid-career analysts, aspiring data scientists, business managers..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          </WizardStep>

          <WizardStep
            step={2}
            currentStep={step}
            title="Design Your Curriculum"
            description="Build the module → lesson → content block hierarchy with scaffolding options."
            icon={<BookOpen className="h-5 w-5" />}
            onBack={handleBack}
          >
            {form.courseId ? (
              <ModuleBuilder
                courseId={form.courseId}
                modules={form.modules}
                onSave={() => refreshModules(form.courseId!)}
              />
            ) : (
              <Card className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-sm text-gray-600">Setting up your course workspace...</p>
              </Card>
            )}
          </WizardStep>

          <WizardStep
            step={3}
            currentStep={step}
            title="Define Competencies"
            description="Map competencies to content blocks using Bloom's taxonomy for measurable learning outcomes."
            icon={<Award className="h-5 w-5" />}
            onBack={handleBack}
          >
            {form.courseId ? (
              <CompetencyManager
                competencies={form.competencies}
                onCreate={handleCompetencyCreate}
                onUpdate={handleCompetencyUpdate}
                onDelete={handleCompetencyDelete}
              />
            ) : (
              <p className="text-sm text-gray-500">Save the course first to add competencies.</p>
            )}
          </WizardStep>

          <WizardStep
            step={4}
            currentStep={step}
            title="Build Assessments"
            description="Create adaptive checkpoints and module quizzes. The engine adjusts difficulty using IRT."
            icon={<HelpCircle className="h-5 w-5" />}
            onBack={handleBack}
          >
            <AssessmentGallery
              courseId={form.courseId}
              modules={form.modules}
              competencies={form.competencies}
              onCreateAssessment={handleAssessmentCreate}
              onCreateQuestion={handleCreateQuestion}
              onUpdateQuestion={handleQuestionUpdate}
              onDeleteQuestion={handleQuestionDelete}
              onRefreshAssessments={refreshAssessments}
              onToast={addToast}
            />
          </WizardStep>

          <WizardStep
            step={5}
            currentStep={step}
            title="Configure Pathways"
            description="Set adaptive routing rules so struggling learners receive remediation and advanced learners accelerate."
            icon={<GitBranch className="h-5 w-4" />}
            onBack={handleBack}
          >
            {form.courseId ? (
              <PathwayCanvas
                rules={pathwayRules.filter(p => p.courseId === form.courseId)}
                onCreateRule={handlePathwayCreate}
                onUpdateRule={handlePathwayUpdate}
                onDeleteRule={handlePathwayDelete}
                unitOptions={form.modules.flatMap(m => [
                  { id: m.id, label: `Module: ${m.title}` },
                  ...m.lessons.map(l => ({ id: l.id, label: `Lesson: ${l.title}` })),
                ])}
              />
            ) : (
              <p className="text-sm text-gray-500">Save the course to configure pathways.</p>
            )}
          </WizardStep>

          <WizardStep
            step={6}
            currentStep={step}
            title="Review & Publish"
            description="Verify your course setup before publishing. All sections show current status."
            icon={<Eye className="h-5 w-5" />}
            isLast={true}
            isValid={!!form.courseId}
            onBack={handleBack}
          >
            <div className="space-y-4">
              <ReviewSection
                icon={<FileText className="h-4 w-4" />}
                title="Course Frame"
                items={[
                  { label: 'Title', value: form.title },
                  { label: 'Category', value: form.category },
                  { label: 'Level', value: form.level },
                  { label: 'Price', value: form.price ? `$${form.price}` : 'Not set' },
                  { label: 'Duration', value: form.duration || 'Not set' },
                  { label: 'Study Hours', value: form.estimatedHours || 'Not set' },
                  { label: 'Audience', value: form.targetAudience || 'Not specified' },
                  { label: 'Objectives', value: `${form.learningObjectives.filter(Boolean).length} defined` },
                ]}
              />
              <ReviewSection
                icon={<BookOpen className="h-4 w-4" />}
                title="Curriculum"
                items={[
                  { label: 'Modules', value: `${form.modules.length} modules` },
                  { label: 'Lessons', value: `${moduleCount} lessons` },
                  { label: 'Content Blocks', value: `${form.contentBlocks.length} blocks` },
                ]}
                action={<Button variant="outline" size="sm" onClick={() => setStep(2)}>Edit Structure →</Button>}
              />
              <ReviewSection
                icon={<Award className="h-4 w-4" />}
                title="Competencies"
                items={[
                  { label: 'Total', value: `${competencyCount} defined` },
                  { label: 'Bloom Levels', value: `${new Set(form.competencies.map(c => c.taxonomyLevel)).size} covered` },
                ]}
                action={<Button variant="outline" size="sm" onClick={() => setStep(3)}>Edit Competencies →</Button>}
              />
              <ReviewSection
                icon={<HelpCircle className="h-4 w-4" />}
                title="Assessments"
                items={[
                  { label: 'Assessments', value: `${assessmentList.length} created` },
                  { label: 'Questions', value: `${questionCount} items` },
                  { label: 'Adaptive', value: `${assessmentList.filter(a => a.isAdaptive).length} adaptive` },
                ]}
              />
              <ReviewSection
                icon={<GitBranch className="h-4 w-4" />}
                title="Pathways"
                items={[
                  { label: 'Active Rules', value: `${pathwayCount} active` },
                  { label: 'Total Rules', value: `${pathwayRules.filter(p => p.courseId === form.courseId).length} configured` },
                ]}
                action={<Button variant="outline" size="sm" onClick={() => setStep(5)}>Edit Pathways →</Button>}
              />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>Before publishing:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs ml-2">
                  <li>Course has a title, category, and learning objectives</li>
                  <li>At least one module with one lesson exists</li>
                  <li>At least one competency is defined and tagged to content</li>
                  <li>Content blocks include checkpoints, scaffolding tiers, and reflection prompts within lessons</li>
                  <li>At least one adaptive assessment or checkpoint is configured</li>
                  <li>Pathway rules handle remediation for struggling learners</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="lg"
                  onClick={handlePublish}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : <><CheckCircle2 className="h-4 w-4" /> Publish Course</>}
                </Button>
              </div>
            </div>
          </WizardStep>
        </form>
      </div>
    </DashboardShell>
  )
}

function ReviewSection({
  icon,
  title,
  items,
  action,
}: {
  icon: React.ReactNode
  title: string
  items: { label: string; value: string }[]
  action?: React.ReactNode
}) {
  return (
    <div className="border rounded-lg p-4 flex items-start gap-3">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm text-gray-900">{title}</h3>
          {action}
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          {items.map(item => (
            <div key={item.label}>
              <dt className="text-xs text-gray-500">{item.label}</dt>
              <dd className="text-sm text-gray-800 font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function AssessmentGallery({
  courseId,
  modules,
  competencies,
  onCreateAssessment,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onRefreshAssessments,
  onToast,
}: {
  courseId: string | null
  modules: (CourseModule & { lessons: (Lesson & { pages: LessonPage[] })[] })[]
  competencies: Competency[]
  onCreateAssessment: (data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Assessment | void>
  onCreateQuestion: (q: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => Question
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void
  onDeleteQuestion: (id: string) => void
  onRefreshAssessments: () => void
  onToast: (type: 'success' | 'error', message: string) => void
}) {
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    lessonId: '',
    moduleId: '',
    type: 'checkpoint' as Assessment['type'],
    masteryThreshold: 80,
    maxAttempts: 3,
  })

  const allLessons = modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title, moduleId: m.id })))

  useEffect(() => {
    if (allLessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(allLessons[0].id)
      setNewAssessment(prev => ({ ...prev, lessonId: allLessons[0].id, moduleId: allLessons[0].moduleId }))
    }
  }, [modules, selectedLessonId, allLessons])

  useEffect(() => { onRefreshAssessments() }, [courseId, onRefreshAssessments])

  const assessmentList = courseId ? assessments.filter(a => a.courseId === courseId && a.lessonId === selectedLessonId) : []

  const handleCreateAssessment = async () => {
    if (!newAssessment.title.trim() || !newAssessment.lessonId) return
    await onCreateAssessment({
      courseId: courseId!,
      lessonId: newAssessment.lessonId,
      moduleId: newAssessment.moduleId,
      type: newAssessment.type,
      title: newAssessment.title,
      description: newAssessment.description,
      masteryThreshold: newAssessment.masteryThreshold,
      maxAttempts: newAssessment.maxAttempts,
      isAdaptive: true,
      irtStartingDifficulty: 0.5,
      cooldownMinutes: 0,
      questionPoolIds: [],
      passageageThreshold: 0.7,
      showFeedbackImmediately: true,
      randomizeOrder: true,
      isPublished: false,
    })
    setShowCreate(false)
    setNewAssessment({ title: '', description: '', lessonId: selectedLessonId, moduleId: '', type: 'checkpoint', masteryThreshold: 80, maxAttempts: 3 })
    onToast('success', 'Assessment created. Add questions below.')
  }

  return (
    <div className="space-y-4">
      {allLessons.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">Add lessons in the Structure step before configuring assessments.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => { /* navigate */ }}>
            Go to Structure →
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Label className="text-sm">Lesson:</Label>
            <select
              value={selectedLessonId}
              onChange={e => {
                setSelectedLessonId(e.target.value)
                const lesson = allLessons.find(l => l.id === e.target.value)
                setNewAssessment(prev => ({ ...prev, lessonId: e.target.value, moduleId: lesson?.moduleId || '' }))
              }}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              {allLessons.map(l => (
                <option key={l.id} value={l.id}>{l.moduleTitle} → {l.title}</option>
              ))}
            </select>
            {!showCreate && (
              <Button size="sm" variant="outline" onClick={() => setShowCreate(true)} className="ml-auto">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Assessment
              </Button>
            )}
          </div>

          {showCreate && (
            <Card className="p-4 border-blue-200 bg-blue-50/50 space-y-3">
              <p className="text-xs font-medium text-blue-800">New Assessment</p>
              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-blue-700">Title</Label>
                  <Input
                    value={newAssessment.title}
                    onChange={e => setNewAssessment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Module 1 Quiz"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-blue-700">Type</Label>
                  <Select value={newAssessment.type} onValueChange={(v: Assessment['type']) => setNewAssessment(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkpoint">Checkpoint</SelectItem>
                      <SelectItem value="module_quiz">Module Quiz</SelectItem>
                      <SelectItem value="final_exam">Final Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="adaptive" checked disabled />
                  <Label htmlFor="adaptive" className="text-xs">Adaptive (IRT)</Label>
                </div>
                <div>
                  <Label className="text-xs text-blue-700">Mastery %</Label>
                  <Input
                    type="number"
                    value={newAssessment.masteryThreshold}
                    onChange={e => setNewAssessment(prev => ({ ...prev, masteryThreshold: parseInt(e.target.value) || 80 }))}
                    className="h-7 w-20 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-blue-700">Max Attempts</Label>
                  <Input
                    type="number"
                    value={newAssessment.maxAttempts}
                    onChange={e => setNewAssessment(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 3 }))}
                    className="h-7 w-20 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCreateAssessment} disabled={!newAssessment.title.trim()}>Create Assessment</Button>
              </div>
            </Card>
          )}

          {assessmentList.length === 0 && !showCreate && (
            <div className="text-center py-8 text-gray-400">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No assessments for this lesson yet.</p>
            </div>
          )}
          {assessmentList.map(assessment => (
            <AssessmentEditor
              key={assessment.id}
              assessment={assessment}
              questions={questions.filter(q => q.assessmentId === assessment.id)}
              onUpdateAssessment={async (id, updates) => {
                updateAssessment(id, updates)
                onRefreshAssessments()
              }}
              onCreateQuestion={onCreateQuestion}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
            />
          ))}
        </>
      )}
    </div>
  )
}

export function CourseCreationWizardWrapper() {
  return (
    <ProtectedRoute permissions={['create_courses', 'edit_own_courses']}>
      <CourseCreationWizardPage />
    </ProtectedRoute>
  )
}
