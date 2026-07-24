import { NextRequest, NextResponse } from 'next/server'
import { getCompetencies, getCompetencyById, createCompetency, updateCompetency, deleteCompetency } from '@/lib/courseBuilder'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const items = getCompetencies(courseId)
    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch competencies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const body = await request.json()
    const item = createCompetency({
      courseId,
      code: body.code || `C${Date.now().toString(36)}`,
      label: body.label,
      description: body.description || '',
      taxonomyLevel: body.taxonomyLevel || 'understand',
      weight: body.weight ?? 1,
      parentId: body.parentId,
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create competency' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const item = updateCompetency(id, body)
    if (!item) return NextResponse.json({ success: false, error: 'Competency not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: item })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update competency' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = deleteCompetency(id)
    if (!deleted) return NextResponse.json({ success: false, error: 'Competency not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete competency' }, { status: 500 })
  }
}
