import { NextRequest, NextResponse } from 'next/server'
import { getAssessments, getAssessmentById, createAssessment, updateAssessment, deleteAssessment, getQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/lib/courseBuilder'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope')
    const scopeId = searchParams.get('scopeId')
    let items = getAssessments(courseId)
    if (scope && scopeId) {
      items = items.filter(a => (scope === 'module' ? a.moduleId : a.lessonId) === scopeId)
    }
    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch assessments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const body = await request.json()

    if (body.action === 'create_question' && body.assessmentId) {
      const question = createQuestion({
        assessmentId: body.assessmentId,
        courseId,
        questionType: body.questionType || 'mc',
        prompt: body.prompt || '',
        explanation: body.explanation || '',
        difficulty: body.difficulty || 0.5,
        options: body.options || [],
        correctAnswer: body.correctAnswer,
        competencyTags: body.competencyTags || [],
      })
      return NextResponse.json({ success: true, data: question }, { status: 201 })
    }

    const assessment = createAssessment({
      courseId,
      moduleId: body.moduleId,
      lessonId: body.lessonId,
      title: body.title || 'Untitled Assessment',
      description: body.description || '',
      type: body.type || 'checkpoint',
      isAdaptive: body.isAdaptive ?? true,
      irtStartingDifficulty: body.irtStartingDifficulty ?? 0.5,
      masteryThreshold: body.masteryThreshold ?? 80,
      maxAttempts: body.maxAttempts ?? 3,
      cooldownMinutes: body.cooldownMinutes ?? 0,
      timeLimitMinutes: body.timeLimitMinutes,
      questionPoolIds: body.questionPoolIds || [],
      passageageThreshold: body.passageageThreshold ?? 0.7,
      showFeedbackImmediately: body.showFeedbackImmediately ?? true,
      randomizeOrder: body.randomizeOrder ?? true,
      isPublished: body.isPublished ?? false,
    })
    return NextResponse.json({ success: true, data: assessment }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create assessment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.questionId) {
      const question = updateQuestion(body.questionId, body.data)
      if (!question) return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: question })
    }

    const assessment = updateAssessment(id, body.data)
    if (!assessment) return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: assessment })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update assessment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    if (body.questionId) {
      const deleted = deleteQuestion(body.questionId)
      if (!deleted) return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }
    const { id } = await params
    const deleted = deleteAssessment(id)
    if (!deleted) return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 })
  }
}
