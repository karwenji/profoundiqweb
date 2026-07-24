export type ContentType = 'video' | 'text' | 'quiz' | 'assignment' | 'reflection'
export type ContentBlockType = 'text' | 'video' | 'audio' | 'image' | 'quiz' | 'assignment' | 'reflection_prompt' | 'checkpoint' | 'sandbox' | 'simulation'
export type UnlockRule = 'sequential' | 'all_open' | 'prerequisite'
export type GateType = 'score' | 'time' | 'manual'
export type QuestionType = 'mc' | 'ma' | 'true_false' | 'drag_drop' | 'numeric' | 'file_upload' | 'video_response' | 'voice_response'
export type PathwayCondition = 'score_below' | 'score_above' | 'confidence_low' | 'competency_gap' | 'time_exceeded'
export type ComprehensionLevel = 'none' | 'low' | 'medium' | 'high'
export type XPTransactionSource =
  | 'lesson_complete'
  | 'module_complete'
  | 'course_complete'
  | 'daily_login'
  | 'quiz_perfect'
  | 'assignment_on_time'
  | 'streak_bonus'
  | 'peer_help'
  | 'admin_adjustment'
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type BadgeCategory = 'milestone' | 'consistency' | 'mastery' | 'social' | 'special'
export type LeaderboardScope = 'course' | 'platform'
export type LeaderboardPeriod = 'week' | 'alltime'

export interface ContentBlock {
  id: string
  lessonId: string
  moduleId: string
  courseId: string
  blockType: ContentBlockType
  title: string
  content: string
  mediaUrl?: string
  mediaType?: 'video' | 'audio' | 'image' | 'document'
  competencyTags: string[]
  order: number
  supportsScaffolding: boolean
  scaffoldLayers: ScaffoldLayer[]
  minDwellSeconds: number
  checkpointConfig?: CheckpointConfig
  reflectionConfig?: ReflectionConfig
  createdAt: string
  updatedAt: string
}

export interface ScaffoldLayer {
  id: string
  label: 'core' | 'reinforce' | 'enrich'
  content: string
  condition?: ComprehensionLevel
}

export interface CheckpointConfig {
  id: string
  question: string
  questionType: QuestionType
  options?: { id: string; text: string; isCorrect: boolean }[]
  correctAnswer?: string | string[]
  passageageThreshold: number
  masteryThreshold: number
  feedbackCorrect: string
  feedbackIncorrect: string
  allowRetry: boolean
  maxAttempts: number
  competencyTags: string[]
}

export interface ReflectionConfig {
  prompt: string
  minWordCount: number
  rubricId?: string
  allowAnonymous: boolean
}

export interface Competency {
  id: string
  courseId: string
  code: string
  label: string
  description: string
  taxonomyLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
  weight: number
  parentId?: string
  createdAt: string
  updatedAt: string
}

export interface Assessment {
  id: string
  courseId: string
  moduleId?: string
  lessonId?: string
  title: string
  description: string
  type: 'checkpoint' | 'module_quiz' | 'final_exam'
  isAdaptive: boolean
  irtStartingDifficulty: number
  masteryThreshold: number
  maxAttempts: number
  cooldownMinutes: number
  timeLimitMinutes?: number
  questionPoolIds: string[]
  passageageThreshold: number
  showFeedbackImmediately: boolean
  randomizeOrder: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  assessmentId: string
  courseId: string
  questionType: QuestionType
  prompt: string
  explanation: string
  difficulty: number
  options: { id: string; text: string; isCorrect: boolean }[]
  correctAnswer?: string | string[]
  competencyTags: string[]
  createdAt: string
  updatedAt: string
}

export interface PrerequisiteGate {
  id: string
  courseId: string
  moduleId?: string
  lessonId?: string
  gateType: GateType
  threshold: number
  unitId: string
  unitType: 'module' | 'lesson'
  remediationContentBlockIds: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface PathwayRule {
  id: string
  courseId: string
  name: string
  description: string
  isActive: boolean
  conditions: PathwayCondition[]
  sourceUnitId: string
  sourceUnitType: 'module' | 'lesson' | 'checkpoint'
  trueBranchId: string
  falseBranchId: string
  priority: number
  createdAt: string
  updatedAt: string
}

export interface SpacedReviewItem {
  id: string
  userId: string
  courseId: string
  contentType: 'module' | 'lesson' | 'checkpoint'
  contentId: string
  nextReviewAt: string
  intervalDays: number
  easeFactor: number
  repetitions: number
  lastReviewedAt?: string
  masteryScore: number
  createdAt: string
  updatedAt: string
}

export interface CompetencyMastery {
  userId: string
  courseId: string
  competencyId: string
  masteryScore: number
  attempts: number
  lastAttemptAt: string
  evidenceCount: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  unlockRule: UnlockRule
  prerequisites: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  moduleId: string
  courseId: string
  title: string
  description: string
  order: number
  durationMinutes: number
  contentType: ContentType
  isFree: boolean
  totalPages: number
  xpReward: number
  quizId?: string
  createdAt: string
  updatedAt: string
}

export interface LessonPage {
  id: string
  lessonId: string
  moduleId: string
  courseId: string
  pageNumber: number
  content: string
  contentType: ContentType
  mediaUrl?: string
  minDwellSeconds: number
  createdAt: string
  updatedAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  tier: BadgeTier
  category: BadgeCategory
  criteria: BadgeCriteria
  xpReward: number
  rarity: number
}

export interface BadgeCriteria {
  type: 'lesson_count' | 'module_complete' | 'streak_days' | 'quiz_score' | 'course_complete'
  threshold: number
  scope: 'course' | 'platform'
  courseId?: string
}

export interface XPTransaction {
  id: string
  userId: string
  courseId?: string
  lessonId?: string
  amount: number
  source: XPTransactionSource
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface StreakRecord {
  userId: string
  currentStreak: number
  longestStreak: number
  streakFreezes: number
  lastActivityDate: string
  lastFreezeUsedDate?: string
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar?: string
  totalXP: number
  level: number
  currentStreak: number
  badgesCount: number
  rank: number
  score: number
}

export interface LearnerProgress {
  userId: string
  courseId: string
  moduleProgress: Record<string, ModuleProgress>
  currentModuleId?: string
  currentLessonId?: string
  currentPageNumber?: number
  overallProgress: number
  totalXP: number
  level: number
  enrolledAt: string
  completedAt?: string
  lastAccessedAt: string
}

export interface ModuleProgress {
  moduleId: string
  completedLessons: string[]
  currentLessonId?: string
  completedPages: Record<string, number[]>
  moduleXP: number
  isComplete: boolean
  completedAt?: string
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  issuedAt: string
  certificateNumber: string
  downloadUrl?: string
  verificationUrl?: string
}

export interface XPContext {
  streakDays: number
  level: number
  courseId?: string
  lessonId?: string
  moduleId?: string
}

export interface StreakUpdateResult {
  streak: number
  longestStreak: number
  bonusMultiplier: number
  milestones: number[]
  freezeUsed?: boolean
  streakReset?: boolean
}

export interface PageCompletionPayload {
  pageId: string
  lessonId: string
  moduleId: string
  courseId: string
  dwellSeconds: number
  scrollDepth: number
}

export interface PageCompletionResult {
  success: boolean
  xpEarned: number
  newLevel: number
  leveledUp: boolean
  newBadges: Badge[]
  progress: {
    coursePercent: number
    modulePercent: number
    nextPageId?: string
  }
  streak: {
    current: number
    bonusMultiplier: number
  }
}
