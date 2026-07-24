import { NextRequest, NextResponse } from 'next/server'
import { getContentBlocks, getContentBlocksByModule, createContentBlock, updateContentBlock, deleteContentBlock, reorderContentBlocks } from '@/lib/courseBuilder'
import type { ContentBlockType } from '@/types/courseWorkflow'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const moduleId = searchParams.get('moduleId')
    if (lessonId) {
      const items = getContentBlocks(lessonId)
      return NextResponse.json({ success: true, data: items })
    }
    if (moduleId) {
      const items = getContentBlocksByModule(moduleId)
      return NextResponse.json({ success: true, data: items })
    }
    return NextResponse.json({ success: true, data: [] })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch content blocks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { action, lessonId, moduleId } = body

    if (action === 'reorder' && lessonId && body.orderedIds) {
      const items = reorderContentBlocks(lessonId, body.orderedIds)
      return NextResponse.json({ success: true, data: items })
    }

    if (!lessonId || !moduleId) {
      return NextResponse.json({ success: false, error: 'lessonId and moduleId required' }, { status: 400 })
    }

    const block = createContentBlock({
      lessonId,
      moduleId,
      courseId,
      blockType: (body.blockType as ContentBlockType) || 'text',
      title: body.title || 'Untitled Block',
      content: body.content || '',
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType,
      competencyTags: body.competencyTags || [],
      order: body.order ?? 0,
      supportsScaffolding: body.supportsScaffolding ?? false,
      scaffoldLayers: body.scaffoldLayers || [],
      minDwellSeconds: body.minDwellSeconds || 30,
      checkpointConfig: body.checkpointConfig,
      reflectionConfig: body.reflectionConfig,
    })
    return NextResponse.json({ success: true, data: block }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create content block' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { blockId, data } = body
    if (!blockId) return NextResponse.json({ success: false, error: 'blockId required' }, { status: 400 })
    const block = updateContentBlock(blockId, data)
    if (!block) return NextResponse.json({ success: false, error: 'Content block not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: block })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update content block' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { blockId } = body
    if (!blockId) return NextResponse.json({ success: false, error: 'blockId required' }, { status: 400 })
    const deleted = deleteContentBlock(blockId)
    if (!deleted) return NextResponse.json({ success: false, error: 'Content block not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete content block' }, { status: 500 })
  }
}
