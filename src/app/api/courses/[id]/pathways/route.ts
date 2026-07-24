import { NextRequest, NextResponse } from 'next/server'
import { getPathwayRules, getPathwayRuleById, createPathwayRule, updatePathwayRule, deletePathwayRule } from '@/lib/courseBuilder'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const items = getPathwayRules(courseId)
    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch pathway rules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const body = await request.json()
    const rule = createPathwayRule({
      courseId,
      name: body.name || 'Untitled Rule',
      description: body.description || '',
      isActive: body.isActive ?? true,
      conditions: body.conditions || [],
      sourceUnitId: body.sourceUnitId,
      sourceUnitType: body.sourceUnitType || 'lesson',
      trueBranchId: body.trueBranchId || '',
      falseBranchId: body.falseBranchId || '',
      priority: body.priority ?? 0,
    })
    return NextResponse.json({ success: true, data: rule }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create pathway rule' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { ruleId } = body
    if (!ruleId) return NextResponse.json({ success: false, error: 'ruleId required' }, { status: 400 })
    const { id: courseId } = await params
    const rule = updatePathwayRule(ruleId, { ...body, courseId })
    if (!rule) return NextResponse.json({ success: false, error: 'Pathway rule not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: rule })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update pathway rule' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { ruleId } = body
    if (!ruleId) return NextResponse.json({ success: false, error: 'ruleId required' }, { status: 400 })
    const deleted = deletePathwayRule(ruleId)
    if (!deleted) return NextResponse.json({ success: false, error: 'Pathway rule not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete pathway rule' }, { status: 500 })
  }
}
