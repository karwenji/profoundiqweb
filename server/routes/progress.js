const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { broadcast } = require('./events');

function getOrCreateProgress(userId, courseId) {
  let progress = db.prepare('SELECT * FROM learner_progress WHERE user_id = ? AND course_id = ?').get(userId, courseId);
  if (!progress) {
    const id = uuidv4();
    db.prepare('INSERT INTO learner_progress (user_id, course_id) VALUES (?, ?)').run(userId, courseId);
    progress = db.prepare('SELECT * FROM learner_progress WHERE user_id = ? AND course_id = ?').get(userId, courseId);
  }
  return progress;
}

function calculateLevel(totalXP) {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

function calculateXP(source, streakDays, level) {
  const base = {
    lesson_complete: 20, module_complete: 100, course_complete: 500, daily_login: 5,
    quiz_perfect: 50, assignment_on_time: 40, streak_bonus: 0, peer_help: 30, admin_adjustment: 0
  };
  let xp = base[source] || 0;
  if (source === 'lesson_complete' || source === 'daily_login') {
    xp = Math.round(xp * Math.min(2, 1 + streakDays * 0.01));
  }
  if (level > 5) {
    xp = Math.round(xp * (1 + (level - 5) * 0.05));
  }
  return xp;
}

function awardXP(userId, courseId, lessonId, amount, source, metadata = {}) {
  const id = uuidv4();
  db.prepare('INSERT INTO xp_transactions (id, user_id, course_id, lesson_id, amount, source, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, courseId || null, lessonId || null, amount, source, JSON.stringify(metadata));
  return amount;
}

function checkBadges(userId, action, streakDays, courseId) {
  const badgeDefs = [
    { id: 'b-1', name: 'First Steps', description: 'Complete your first lesson', tier: 'bronze', category: 'milestone', criteria_type: 'lesson_count', criteria_threshold: 1, criteria_scope: 'course', xp_reward: 50 },
    { id: 'b-2', name: 'Module Master', description: 'Complete your first module', tier: 'silver', category: 'milestone', criteria_type: 'module_complete', criteria_threshold: 1, criteria_scope: 'course', xp_reward: 100 },
    { id: 'b-3', name: 'On Fire', description: 'Maintain a 7-day learning streak', tier: 'gold', category: 'consistency', criteria_type: 'streak_days', criteria_threshold: 7, criteria_scope: 'platform', xp_reward: 200 },
    { id: 'b-4', name: 'Perfect Score', description: 'Score 100% on any quiz', tier: 'platinum', category: 'mastery', criteria_type: 'quiz_score', criteria_threshold: 100, criteria_scope: 'platform', xp_reward: 100 },
    { id: 'b-5', name: 'Course Conqueror', description: 'Complete your first course', tier: 'gold', category: 'milestone', criteria_type: 'course_complete', criteria_threshold: 1, criteria_scope: 'course', xp_reward: 500 },
  ];

  const earned = [];
  for (const badge of badgeDefs) {
    const exists = db.prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?').get(userId, badge.id);
    if (exists) continue;

    let matches = false;
    if (badge.criteria_type === 'lesson_count' && action === 'lesson_complete') {
      const count = db.prepare('SELECT COUNT(*) as cnt FROM xp_transactions WHERE user_id = ? AND source = ?').get(userId, 'lesson_complete');
      matches = (count?.cnt || 0) >= badge.criteria_threshold;
    } else if (badge.criteria_type === 'module_complete' && action === 'module_complete') {
      matches = true;
    } else if (badge.criteria_type === 'streak_days' && streakDays >= badge.criteria_threshold) {
      matches = true;
    } else if (badge.criteria_type === 'quiz_score' && action === 'quiz_perfect') {
      matches = true;
    } else if (badge.criteria_type === 'course_complete' && action === 'course_complete') {
      matches = true;
    }

    if (matches) {
      db.prepare('INSERT INTO user_badges (id, user_id, badge_id, course_id) VALUES (?, ?, ?, ?)').run(uuidv4(), userId, badge.id, courseId || null);
      if (badge.xp_reward > 0) awardXP(userId, null, null, badge.xp_reward, 'admin_adjustment', { reason: `Badge: ${badge.name}` });
      earned.push(badge);
    }
  }
  return earned;
}

function updateStreak(userId) {
  const today = new Date().toISOString().split('T')[0];
  const record = db.prepare('SELECT * FROM streak_records WHERE user_id = ?').get(userId);
  if (!record) {
    db.prepare('INSERT INTO streak_records (user_id, current_streak, longest_streak, streak_freezes, last_activity_date) VALUES (?, 1, 1, 0, ?)').run(userId, today);
    return { streak: 1, longestStreak: 1, bonusMultiplier: 1.01 };
  }
  const lastDate = record.last_activity_date;
  if (!lastDate) {
    db.prepare('UPDATE streak_records SET current_streak = 1, longest_streak = 1, last_activity_date = ? WHERE user_id = ?').run(today, userId);
    return { streak: 1, longestStreak: 1, bonusMultiplier: 1.01 };
  }
  const daysSince = Math.floor((new Date(today) - new Date(lastDate)) / 86400000);
  if (daysSince === 0) {
    return { streak: record.current_streak, longestStreak: record.longest_streak, bonusMultiplier: Math.min(2, 1 + record.current_streak * 0.01) };
  }
  if (daysSince === 1) {
    const newStreak = record.current_streak + 1;
    db.prepare('UPDATE streak_records SET current_streak = ?, longest_streak = MAX(longest_streak, ?), last_activity_date = ? WHERE user_id = ?').run(newStreak, newStreak, today, userId);
    return { streak: newStreak, longestStreak: Math.max(record.longest_streak, newStreak), bonusMultiplier: Math.min(2, 1 + newStreak * 0.01) };
  }
  db.prepare('UPDATE streak_records SET current_streak = 1, last_activity_date = ? WHERE user_id = ?').run(today, userId);
  return { streak: 1, longestStreak: record.longest_streak, bonusMultiplier: 1.01 };
}

// GET /api/courses/:id/progress
router.get('/:id/progress', authenticateToken, (req, res) => {
  try {
    const progress = getOrCreateProgress(req.user.id, req.params.id);
    const modules = db.prepare('SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC').all(req.params.id);
    const modulesWithProgress = modules.map(m => {
      const lessons = db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index ASC').all(m.id);
      const completedLessons = db.prepare('SELECT DISTINCT lesson_id FROM learner_progress WHERE user_id = ? AND course_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE module_id = ?)').all(req.user.id, req.params.id, m.id);
      const completedLessonIds = completedLessons.map(l => l.lesson_id);
      const moduleProgress = db.prepare('SELECT module_progress FROM learner_progress WHERE user_id = ? AND course_id = ?').get(req.user.id, req.params.id);
      const moduleProg = JSON.parse(moduleProgress?.module_progress || '{}');
      const modProg = moduleProg[m.id] || { completedLessons: [], completedPages: {}, moduleXP: 0, isComplete: false };
      return {
        module: m,
        progress: {
          moduleId: m.id,
          completedLessons: completedLessonIds,
          currentLessonId: progress.current_lesson_id,
          completedPages: modProg.completedPages || {},
          moduleXP: modProg.moduleXP || 0,
          isComplete: modProg.isComplete || false
        },
        lessons
      };
    });
    res.json({ success: true, data: { progress, modules: modulesWithProgress } });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch progress' });
  }
});

// POST /api/courses/:id/progress
router.post('/:id/progress', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    const { action, payload } = req.body;

    if (action === 'page-complete') {
      const pageId = payload.pageId;
      const lessonId = payload.lessonId;
      const moduleId = payload.moduleId;
      const dwellSeconds = payload.dwellSeconds || 0;
      const scrollDepth = payload.scrollDepth || 0;

      const lesson = db.prepare('SELECT * FROM lessons WHERE id = ? AND course_id = ?').get(lessonId, courseId);
      if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found' });

      const module = db.prepare('SELECT * FROM course_modules WHERE id = ? AND course_id = ?').get(moduleId, courseId);
      if (!module) return res.status(404).json({ success: false, error: 'Module not found' });

      const progress = getOrCreateProgress(userId, courseId);
      const streakResult = updateStreak(userId);
      const streakDays = streakResult.streak;
      const currentLevel = calculateLevel(progress.total_xp);
      const xpEarned = calculateXP('lesson_complete', streakDays, currentLevel);

      awardXP(userId, courseId, lessonId, xpEarned, 'lesson_complete', { pageId, dwellSeconds, scrollDepth });

      const moduleProgressRow = db.prepare('SELECT module_progress FROM learner_progress WHERE user_id = ? AND course_id = ?').get(userId, courseId);
      const moduleProg = JSON.parse(moduleProgressRow?.module_progress || '{}');
      const currentModProg = moduleProg[moduleId] || { completedLessons: [], completedPages: {}, moduleXP: 0, isComplete: false };
      const completedPages = currentModProg.completedPages[lessonId] || [];
      if (!completedPages.includes(pageId)) {
        completedPages.push(pageId);
      }
      currentModProg.completedPages[lessonId] = completedPages;
      currentModProg.moduleXP = (currentModProg.moduleXP || 0) + xpEarned;
      moduleProg[moduleId] = currentModProg;

      const newTotalXP = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM xp_transactions WHERE user_id = ?').get(userId).total;
      const newLevel = calculateLevel(newTotalXP);

      db.prepare(`
        UPDATE learner_progress SET module_progress = ?, total_xp = ?, level = ?, current_module_id = ?, current_lesson_id = ?, current_page_number = ?, overall_progress = ?, last_accessed_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND course_id = ?
      `).run(JSON.stringify(moduleProg), newTotalXP, newLevel, moduleId, lessonId, 1, 0, userId, courseId);

      const newBadges = checkBadges(userId, 'lesson_complete', streakDays, courseId);

      broadcast('progress:update', { userId, courseId, xpEarned, newLevel, totalXP: newTotalXP, streak: streakResult });

      res.json({
        success: true,
        data: {
          success: true, xpEarned, newLevel, leveledUp: false, newBadges,
          progress: { coursePercent: 0, modulePercent: 0 },
          streak: { current: streakDays, bonusMultiplier: streakResult.bonusMultiplier }
        }
      });
      return;
    }

    if (action === 'lesson-complete') {
      const { lessonId } = payload;
      const progress = getOrCreateProgress(userId, courseId);
      const streakResult = updateStreak(userId);
      const xpEarned = calculateXP('lesson_complete', streakResult.streak, progress.level);
      awardXP(userId, courseId, lessonId, xpEarned, 'lesson_complete');
      const newTotalXP = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM xp_transactions WHERE user_id = ?').get(userId).total;
      const newLevel = calculateLevel(newTotalXP);
      db.prepare('UPDATE learner_progress SET total_xp = ?, level = ?, last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?').run(newTotalXP, newLevel, userId, courseId);
      const newBadges = checkBadges(userId, 'lesson_complete', streakResult.streak, courseId);
      broadcast('progress:update', { userId, courseId, xpEarned, newLevel, totalXP: newTotalXP, streak: streakResult });
      res.json({ success: true, data: { success: true, xpEarned, newLevel, leveledUp: false, newBadges, progress: { coursePercent: 0, modulePercent: 0 }, streak: { current: streakResult.streak, bonusMultiplier: streakResult.bonusMultiplier } } });
      return;
    }

    if (action === 'module-complete') {
      const { moduleId } = payload;
      const progress = getOrCreateProgress(userId, courseId);
      const streakResult = updateStreak(userId);
      const xpEarned = calculateXP('module_complete', streakResult.streak, progress.level);
      awardXP(userId, courseId, null, xpEarned, 'module_complete');
      const newTotalXP = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM xp_transactions WHERE user_id = ?').get(userId).total;
      const newLevel = calculateLevel(newTotalXP);
      db.prepare('UPDATE learner_progress SET total_xp = ?, level = ?, last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?').run(newTotalXP, newLevel, userId, courseId);
      const newBadges = checkBadges(userId, 'module_complete', streakResult.streak, courseId);
      broadcast('progress:update', { userId, courseId, xpEarned, newLevel, totalXP: newTotalXP, streak: streakResult });
      res.json({ success: true, data: { success: true, xpEarned, newLevel, leveledUp: false, newBadges, progress: { coursePercent: 0, modulePercent: 0 }, streak: { current: streakResult.streak, bonusMultiplier: streakResult.bonusMultiplier } } });
      return;
    }

    res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update progress' });
  }
});

module.exports = router;
