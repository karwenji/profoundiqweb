import { NextRequest, NextResponse } from 'next/server'
import { getCourseModules, createCourseModule as repoCreateModule, updateCourseModule as repoUpdateModule, deleteCourseModule as repoDeleteModule, getLessonsByModule, createLesson as repoCreateLesson, updateLesson as repoUpdateLesson, deleteLesson as repoDeleteLesson, getPagesByLesson, createLessonPage as repoCreatePage, updateLessonPage as repoUpdatePage, deleteLessonPage as repoDeletePage, getLessonById, seedCourseWorkflowData } from '@/lib/courseWorkflow'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const modules = getCourseModules(courseId)
    const modulesWithLessons = modules.map(m => ({
      ...m,
      lessons: getLessonsByModule(m.id).map(l => ({
        ...l,
        pages: getPagesByLesson(l.id),
      })),
    }))
    return NextResponse.json({ success: true, data: modulesWithLessons })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch curriculum' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { action, moduleId, lessonId, pageId, data } = body

    seedCourseWorkflowData()

    if (action === 'create_module') {
      const module = repoCreateModule({
        courseId,
        title: data.title,
        description: data.description,
        order: data.order ?? 0,
        unlockRule: data.unlockRule || 'sequential',
        prerequisites: data.prerequisites || [],
        isPublished: data.isPublished ?? true,
      })
      return NextResponse.json({ success: true, data: module })
    }

    if (action === 'create_lesson' && moduleId) {
      const lesson = repoCreateLesson({
        moduleId,
        courseId,
        title: data.title,
        description: data.description,
        order: data.order ?? 0,
        durationMinutes: data.durationMinutes || 10,
        contentType: data.contentType || 'text',
        isFree: data.isFree || false,
        totalPages: data.totalPages || 1,
        xpReward: data.xpReward || 20,
        quizId: data.quizId,
      })
      return NextResponse.json({ success: true, data: lesson })
    }

    if (action === 'create_page' && lessonId) {
      const lesson = getLessonById(lessonId)
      if (!lesson) return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
      const page = repoCreatePage({
        lessonId,
        moduleId: lesson.moduleId,
        courseId,
        pageNumber: data.pageNumber || 1,
        content: data.content || '',
        contentType: data.contentType || 'text',
        mediaUrl: data.mediaUrl,
        minDwellSeconds: data.minDwellSeconds || 30,
      })
      return NextResponse.json({ success: true, data: page })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create curriculum item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { action, moduleId, lessonId, pageId, data } = body

    if (action === 'update_module' && moduleId) {
      const module = repoUpdateModule(moduleId, data)
      if (!module) return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: module })
    }

    if (action === 'update_lesson' && lessonId) {
      const lesson = repoUpdateLesson(lessonId, data)
      if (!lesson) return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: lesson })
    }

    if (action === 'update_page' && pageId) {
      const page = repoUpdatePage(pageId, data)
      if (!page) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: page })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update curriculum item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { action, moduleId, lessonId, pageId } = body

    if (action === 'delete_module' && moduleId) {
      const deleted = repoDeleteModule(moduleId)
      if (!deleted) return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete_lesson' && lessonId) {
      const deleted = repoDeleteLesson(lessonId)
      if (!deleted) return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete_page' && pageId) {
      const deleted = repoDeletePage(pageId)
      if (!deleted) return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete curriculum item' }, { status: 500 })
  }
}
