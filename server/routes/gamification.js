const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const BADGE_DEFS = [
  { id: 'b-1', name: 'First Steps', description: 'Complete your first lesson', icon: 'Footprints', tier: 'bronze', category: 'milestone', criteria_type: 'lesson_count', criteria_threshold: 1, criteria_scope: 'course', xp_reward: 50, rarity: 10 },
  { id: 'b-2', name: 'Module Master', description: 'Complete your first module', icon: 'BookOpen', tier: 'silver', category: 'milestone', criteria_type: 'module_complete', criteria_threshold: 1, criteria_scope: 'course', xp_reward: 100, rarity: 25 },
  { id: 'b-3', name: 'On Fire', description: 'Maintain a 7-day learning streak', icon: 'Flame', tier: 'gold', category: 'consistency', criteria_type: 'streak_days', criteria_threshold: 7, criteria_scope: 'platform', xp_reward: 200, rarity: 40 },
  { id: 'b-4', name: 'Perfect Score', description: 'Score 100% on any quiz', icon: 'Award', tier: 'platinum', category: 'mastery', criteria_type: 'quiz_score', criteria_threshold: 100, criteria_scope: 'platform', xp_reward: 100, rarity: 60 },
  { id: 'b-5', name: 'Course Conqueror', description: 'Complete your first course', icon: 'Trophy', tier: 'gold', category: 'milestone', criteria_type: 'course_complete', criteria_threshold: 1, criteria_scope: 'course', xp_reward: 500, rarity: 30 },
];

function seedBadges() {
  for (const b of BADGE_DEFS) {
    try {
      db.prepare('INSERT OR IGNORE INTO badges (id, name, description, icon, tier, category, criteria_type, criteria_threshold, criteria_scope, xp_reward, rarity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(b.id, b.name, b.description, b.icon, b.tier, b.category, b.criteria_type, b.criteria_threshold, b.criteria_scope, b.xp_reward, b.rarity);
    } catch (e) { /* ignore if exists */ }
  }
}
seedBadges();

// GET /api/gamification/badges
router.get('/badges', authenticateToken, (req, res) => {
  try {
    const badges = db.prepare('SELECT * FROM badges ORDER BY tier, rarity').all();
    res.json({ success: true, data: badges });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch badges' });
  }
});

// GET /api/gamification/badges/earned
router.get('/badges/earned', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT b.*, ub.earned_at, ub.course_id
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `).all(req.user.id);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch earned badges' });
  }
});

// GET /api/gamification/xp/history
router.get('/xp/history', authenticateToken, (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM xp_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(req.user.id);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch XP history' });
  }
});

// GET /api/gamification/leaderboard
router.get('/leaderboard', authenticateToken, (req, res) => {
  try {
    const scope = req.query.scope || 'platform';
    const period = req.query.period || 'alltime';
    let entries;
    if (scope === 'course' && req.query.courseId) {
      entries = db.prepare(`
        SELECT u.id as userId, u.name as userName, u.avatar as userAvatar,
          COALESCE(SUM(xp.amount), 0) as totalXP,
          COALESCE(MAX(lp.level), 1) as level,
          COALESCE(sr.current_streak, 0) as currentStreak,
          COUNT(DISTINCT ub.id) as badgesCount
        FROM users u
        LEFT JOIN xp_transactions xp ON xp.user_id = u.id AND xp.course_id = ?
        LEFT JOIN learner_progress lp ON lp.user_id = u.id AND lp.course_id = ?
        LEFT JOIN streak_records sr ON sr.user_id = u.id
        LEFT JOIN user_badges ub ON ub.user_id = u.id
        GROUP BY u.id
        ORDER BY totalXP DESC
        LIMIT 100
      `).all(req.query.courseId, req.query.courseId);
    } else {
      entries = db.prepare(`
        SELECT u.id as userId, u.name as userName, u.avatar as userAvatar,
          COALESCE(SUM(xp.amount), 0) as totalXP,
          COALESCE(MAX(lp.level), 1) as level,
          COALESCE(sr.current_streak, 0) as currentStreak,
          COUNT(DISTINCT ub.id) as badgesCount
        FROM users u
        LEFT JOIN xp_transactions xp ON xp.user_id = u.id
        LEFT JOIN learner_progress lp ON lp.user_id = u.id
        LEFT JOIN streak_records sr ON sr.user_id = u.id
        LEFT JOIN user_badges ub ON ub.user_id = u.id
        GROUP BY u.id
        ORDER BY totalXP DESC
        LIMIT 100
      `).all();
    }
    const ranked = entries.map((e, idx) => ({
      ...e,
      rank: idx + 1,
      score: e.totalXP + e.currentStreak * 10 + e.badgesCount * 50
    })).sort((a, b) => b.score - a.score).map((e, idx) => ({ ...e, rank: idx + 1 }));
    res.json({ success: true, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/gamification/streak
router.get('/streak', authenticateToken, (req, res) => {
  try {
    const record = db.prepare('SELECT * FROM streak_records WHERE user_id = ?').get(req.user.id) || { current_streak: 0, longest_streak: 0, streak_freezes: 0, last_activity_date: null };
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch streak' });
  }
});

// GET /api/gamification/certificates
router.get('/certificates', authenticateToken, (req, res) => {
  try {
    const certs = db.prepare(`
      SELECT c.*, co.title as course_title, co.thumbnail as course_thumbnail
      FROM certificates c
      JOIN courses co ON co.id = c.course_id
      WHERE c.user_id = ?
      ORDER BY c.issued_at DESC
    `).all(req.user.id);
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
  }
});

// GET /api/gamification/overview
router.get('/overview', authenticateToken, (req, res) => {
  try {
    const totalXP = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM xp_transactions WHERE user_id = ?').get(req.user.id).total;
    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    const streak = db.prepare('SELECT * FROM streak_records WHERE user_id = ?').get(req.user.id) || { current_streak: 0, longest_streak: 0, streak_freezes: 0 };
    const badgesEarned = db.prepare('SELECT COUNT(*) as cnt FROM user_badges WHERE user_id = ?').get(req.user.id).cnt;
    res.json({ success: true, data: { totalXP, level, streak, badgesEarned } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch gamification overview' });
  }
});

module.exports = router;
