import type {
  Competency,
  Assessment,
  Question,
  PathwayRule,
  PrerequisiteGate,
  SpacedReviewItem,
  CompetencyMastery,
  ContentBlock,
  ScaffoldLayer,
  CheckpointConfig,
} from '@/types/courseWorkflow'

let competencies: Competency[] = []
let assessments: Assessment[] = []
let questions: Question[] = []
let pathwayRules: PathwayRule[] = []
let gates: PrerequisiteGate[] = []
let spacedReviews: SpacedReviewItem[] = []
let competencyMastery: CompetencyMastery[] = []
let contentBlocks: ContentBlock[] = []

export { competencies, assessments, questions, pathwayRules, gates, spacedReviews, competencyMastery, contentBlocks }

let compSeq = 1
let asmtSeq = 1
let qSeq = 1
let pathwaySeq = 1
let gateSeq = 1
let reviewSeq = 1

function nextId(prefix: string, seq: number): string {
  return `${prefix}-${seq}`
}

// ── Competencies ──────────────────────────────────────────────────────────────

export function getCompetencies(courseId: string): Competency[] {
  return competencies.filter(c => c.courseId === courseId).sort((a, b) => a.code.localeCompare(b.code))
}

export function getCompetencyById(id: string): Competency | undefined {
  return competencies.find(c => c.id === id)
}

export function createCompetency(data: Omit<Competency, 'id' | 'createdAt' | 'updatedAt'>): Competency {
  const comp: Competency = { ...data, id: `comp-${compSeq++}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  competencies.push(comp)
  return comp
}

export function updateCompetency(id: string, updates: Partial<Competency>): Competency | undefined {
  const idx = competencies.findIndex(c => c.id === id)
  if (idx === -1) return undefined
  competencies[idx] = { ...competencies[idx], ...updates, updatedAt: new Date().toISOString() }
  return competencies[idx]
}

export function deleteCompetency(id: string): boolean {
  const idx = competencies.findIndex(c => c.id === id)
  if (idx === -1) return false
  competencies.splice(idx, 1)
  return true
}

// ── Assessments ───────────────────────────────────────────────────────────────

export function getAssessments(courseId: string): Assessment[] {
  return assessments.filter(a => a.courseId === courseId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getAssessmentById(id: string): Assessment | undefined {
  return assessments.find(a => a.id === id)
}

export function createAssessment(data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Assessment {
  const asmt: Assessment = { ...data, id: `asmt-${asmtSeq++}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  assessments.push(asmt)
  return asmt
}

export function updateAssessment(id: string, updates: Partial<Assessment>): Assessment | undefined {
  const idx = assessments.findIndex(a => a.id === id)
  if (idx === -1) return undefined
  assessments[idx] = { ...assessments[idx], ...updates, updatedAt: new Date().toISOString() }
  return assessments[idx]
}

export function deleteAssessment(id: string): boolean {
  const idx = assessments.findIndex(a => a.id === id)
  if (idx === -1) return false
  assessments.splice(idx, 1)
  questions.filter(q => q.assessmentId !== id).forEach(q => {})
  return true
}

// ── Questions ─────────────────────────────────────────────────────────────────

export function getQuestions(assessmentId: string): Question[] {
  return questions.filter(q => q.assessmentId === assessmentId).sort((a, b) => a.id.localeCompare(b.id))
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find(q => q.id === id)
}

export function createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Question {
  const q: Question = { ...data, id: `q-${qSeq++}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  questions.push(q)
  return q
}

export function updateQuestion(id: string, updates: Partial<Question>): Question | undefined {
  const idx = questions.findIndex(q => q.id === id)
  if (idx === -1) return undefined
  questions[idx] = { ...questions[idx], ...updates, updatedAt: new Date().toISOString() }
  return questions[idx]
}

export function deleteQuestion(id: string): boolean {
  const idx = questions.findIndex(q => q.id === id)
  if (idx === -1) return false
  questions.splice(idx, 1)
  return true
}

// ── Pathway Rules ─────────────────────────────────────────────────────────────

export function getPathwayRules(courseId: string): PathwayRule[] {
  return pathwayRules.filter(p => p.courseId === courseId).sort((a, b) => a.priority - b.priority)
}

export function getPathwayRuleById(id: string): PathwayRule | undefined {
  return pathwayRules.find(p => p.id === id)
}

export function createPathwayRule(data: Omit<PathwayRule, 'id' | 'createdAt' | 'updatedAt'>): PathwayRule {
  const rule: PathwayRule = { ...data, id: `path-${pathwaySeq++}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  pathwayRules.push(rule)
  return rule
}

export function updatePathwayRule(id: string, updates: Partial<PathwayRule>): PathwayRule | undefined {
  const idx = pathwayRules.findIndex(p => p.id === id)
  if (idx === -1) return undefined
  pathwayRules[idx] = { ...pathwayRules[idx], ...updates, updatedAt: new Date().toISOString() }
  return pathwayRules[idx]
}

export function deletePathwayRule(id: string): boolean {
  const idx = pathwayRules.findIndex(p => p.id === id)
  if (idx === -1) return false
  pathwayRules.splice(idx, 1)
  return true
}

// ── Prerequisite Gates ────────────────────────────────────────────────────────

export function getGates(courseId: string): PrerequisiteGate[] {
  return gates.filter(g => g.courseId === courseId)
}

export function getGateById(id: string): PrerequisiteGate | undefined {
  return gates.find(g => g.id === id)
}

export function createGate(data: Omit<PrerequisiteGate, 'id' | 'createdAt' | 'updatedAt'>): PrerequisiteGate {
  const gate: PrerequisiteGate = { ...data, id: `gate-${gateSeq++}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  gates.push(gate)
  return gate
}

export function updateGate(id: string, updates: Partial<PrerequisiteGate>): PrerequisiteGate | undefined {
  const idx = gates.findIndex(g => g.id === id)
  if (idx === -1) return undefined
  gates[idx] = { ...gates[idx], ...updates, updatedAt: new Date().toISOString() }
  return gates[idx]
}

export function deleteGate(id: string): boolean {
  const idx = gates.findIndex(g => g.id === id)
  if (idx === -1) return false
  gates.splice(idx, 1)
  return true
}

// ── Content Blocks ────────────────────────────────────────────────────────────

export function getContentBlocks(lessonId: string): ContentBlock[] {
  return contentBlocks.filter(b => b.lessonId === lessonId).sort((a, b) => a.order - b.order)
}

export function getContentBlocksByModule(moduleId: string): ContentBlock[] {
  return contentBlocks.filter(b => b.moduleId === moduleId).sort((a, b) => a.order - b.order)
}

export function getContentBlockById(id: string): ContentBlock | undefined {
  return contentBlocks.find(b => b.id === id)
}

export function createContentBlock(data: Omit<ContentBlock, 'id' | 'createdAt' | 'updatedAt'>): ContentBlock {
  const block: ContentBlock = { ...data, id: `blk-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  contentBlocks.push(block)
  return block
}

export function updateContentBlock(id: string, updates: Partial<ContentBlock>): ContentBlock | undefined {
  const idx = contentBlocks.findIndex(b => b.id === id)
  if (idx === -1) return undefined
  contentBlocks[idx] = { ...contentBlocks[idx], ...updates, updatedAt: new Date().toISOString() }
  return contentBlocks[idx]
}

export function deleteContentBlock(id: string): boolean {
  const idx = contentBlocks.findIndex(b => b.id === id)
  if (idx === -1) return false
  contentBlocks.splice(idx, 1)
  return true
}

export function reorderContentBlocks(lessonId: string, orderedIds: string[]): ContentBlock[] {
  const blocks = contentBlocks.filter(b => b.lessonId === lessonId)
  const orderMap = new Map(orderedIds.map((id, i) => [id, i]))
  blocks.forEach(b => {
    const newOrder = orderMap.get(b.id)
    if (newOrder !== undefined) {
      b.order = newOrder
      b.updatedAt = new Date().toISOString()
    }
  })
  return getContentBlocks(lessonId)
}

// ── Spaced Review ─────────────────────────────────────────────────────────────

export function getSpacedReviews(userId: string, courseId?: string): SpacedReviewItem[] {
  return spacedReviews.filter(r => r.userId === userId && (!courseId || r.courseId === courseId))
}

export function getDueReviews(userId: string, courseId?: string): SpacedReviewItem[] {
  const now = new Date().toISOString()
  return spacedReviews.filter(r => r.userId === userId && (!courseId || r.courseId === courseId) && r.nextReviewAt <= now)
}

export function upsertSpacedReview(data: Omit<SpacedReviewItem, 'id' | 'createdAt' | 'updatedAt'>): SpacedReviewItem {
  const existing = spacedReviews.find(r => r.userId === data.userId && r.contentType === data.contentType && r.contentId === data.contentId)
  if (existing) {
    Object.assign(existing, data, { updatedAt: new Date().toISOString() })
    return existing
  }
  const item: SpacedReviewItem = { ...data, id: `review-${reviewSeq++}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  spacedReviews.push(item)
  return item
}

// ── Competency Mastery ────────────────────────────────────────────────────────

export function getCompetencyMastery(userId: string, courseId: string): CompetencyMastery[] {
  return competencyMastery.filter(m => m.userId === userId && m.courseId === courseId)
}

export function getCompetencyMasteryForCompetency(userId: string, courseId: string, competencyId: string): CompetencyMastery | undefined {
  return competencyMastery.find(m => m.userId === userId && m.courseId === courseId && m.competencyId === competencyId)
}

export function upsertCompetencyMastery(data: { userId: string; courseId: string; competencyId: string; masteryScore: number; attempts: number; lastAttemptAt: string; evidenceCount: number; trend: CompetencyMastery['trend'] }): CompetencyMastery {
  const existing = competencyMastery.find(m => m.userId === data.userId && m.courseId === data.courseId && m.competencyId === data.competencyId)
  if (existing) {
    Object.assign(existing, data)
    return existing
  }
  const mastery: CompetencyMastery = { ...data }
  competencyMastery.push(mastery)
  return mastery
}

// ── Gating Engine ─────────────────────────────────────────────────────────────

export function evaluateGate(gate: PrerequisiteGate, learnerProgress: { [key: string]: number }): { passed: boolean; missingSource: boolean } {
  const sourceScore = learnerProgress[gate.unitId]
  if (sourceScore === undefined) return { passed: false, missingSource: true }
  switch (gate.gateType) {
    case 'score':
      return { passed: sourceScore >= gate.threshold, missingSource: false }
    case 'time':
      return { passed: sourceScore >= gate.threshold, missingSource: false }
    case 'manual':
      return { passed: false, missingSource: false }
    default:
      return { passed: false, missingSource: false }
  }
}

export function getRemediationContent(gate: PrerequisiteGate): { blockIds: string[]; label: string } {
  return {
    blockIds: gate.remediationContentBlockIds,
    label: `Remediation: ${gate.unitType} ${gate.unitId}`,
  }
}

// ── Pathway Engine ────────────────────────────────────────────────────────────

export function evaluatePathway(rule: PathwayRule, learnerState: { score?: number; confidence?: number; competencyScores?: Record<string, number> }): 'true' | 'false' {
  for (const condition of rule.conditions) {
    switch (condition) {
      case 'score_below':
        if (learnerState.score !== undefined && learnerState.score >= 70) return 'false'
        break
      case 'score_above':
        if (learnerState.score !== undefined && learnerState.score < 70) return 'false'
        break
      case 'confidence_low':
        if (learnerState.confidence !== undefined && learnerState.confidence >= 3) return 'false'
        break
      case 'competency_gap':
        if (learnerState.competencyScores) {
          const hasGap = Object.values(learnerState.competencyScores).some(s => s < 60)
          if (!hasGap) return 'false'
        }
        break
      case 'time_exceeded':
        break
    }
  }
  return 'true'
}

export function getNextPathwayBranch(rule: PathwayRule, learnerState: { score?: number; confidence?: number; competencyScores?: Record<string, number> }): string {
  const branch = evaluatePathway(rule, learnerState)
  return branch === 'true' ? rule.trueBranchId : rule.falseBranchId
}

// ── Spaced Retrieval Scheduler ────────────────────────────────────────────────

const SM2_INTERVALS = [1, 6, 14, 30]

export function scheduleNextReview(item: SpacedReviewItem, quality: number): SpacedReviewItem {
  let { intervalDays, easeFactor, repetitions } = item
  if (quality >= 3) {
    repetitions += 1
    intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(intervalDays * easeFactor)
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  } else {
    repetitions = 1
    intervalDays = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  }
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays)
  return upsertSpacedReview({
    ...item,
    intervalDays,
    easeFactor,
    repetitions,
    nextReviewAt: nextReviewAt.toISOString(),
  })
}

// ── Competency Mastery Aggregation ───────────────────────────────────────────

export function calculateWeightedMastery(
  checkpointScore: number,
  assessmentScore: number,
  behavioralSignals: { dwellRatio: number; retries: number; helpSeeking: number },
): number {
  const behavioralScore = Math.max(0, 100 - behavioralSignals.retries * 10 - behavioralSignals.helpSeeking * 5)
  const dwellScore = Math.min(100, behavioralSignals.dwellRatio * 100)
  const behavioralComposite = behavioralScore * 0.5 + dwellScore * 0.5
  return checkpointScore * 0.4 + assessmentScore * 0.4 + behavioralComposite * 0.2
}

export function calculateCourseCompetencies(userId: string, courseId: string): { competencyId: string; label: string; mastery: number; trend: CompetencyMastery['trend'] }[] {
  const masteryRecords = getCompetencyMastery(userId, courseId)
  return masteryRecords.map(m => ({
    competencyId: m.competencyId,
    label: getCompetencyById(m.competencyId)?.label || m.competencyId,
    mastery: Math.round(m.masteryScore),
    trend: m.trend,
  }))
}
