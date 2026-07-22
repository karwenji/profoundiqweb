const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

// GET /api/analytics/dashboard
router.get('/dashboard', auth, (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    if (role === 'student') {
      const enrollments = db.prepare(`
        SELECT e.*, c.title, c.thumbnail, c.instructor_id, u.name as instructor_name
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        JOIN users u ON u.id = c.instructor_id
        WHERE e.user_id = ?
        ORDER BY e.last_accessed_at DESC
      `).all(userId);

      const totalXP = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM xp_transactions WHERE user_id = ?').get(userId).total;
      const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
      const streak = db.prepare('SELECT current_streak, longest_streak FROM streak_records WHERE user_id = ?').get(userId) || { current_streak: 0, longest_streak: 0 };
      const certificates = db.prepare('SELECT COUNT(*) as cnt FROM certificates WHERE user_id = ?').get(userId).cnt;
      const completedCourses = enrollments.filter(e => e.completed === 1).length;
      const inProgressCourses = enrollments.filter(e => e.completed === 0 && e.progress > 0).length;

      return res.json({
        success: true,
        data: {
          role: 'student',
          stats: { enrolledCourses: enrollments.length, completedCourses, inProgressCourses, certificatesEarned: certificates, totalXP, level, streakDays: streak.current_streak, longestStreak: streak.longest_streak },
          courses: enrollments.map(e => ({
            id: e.course_id,
            title: e.title,
            progress: Math.round(e.progress || 0),
            lastAccessed: e.last_accessed_at || e.enrolled_at,
            totalLessons: 0,
            completedLessons: 0
          }))
        }
      });
    }

    if (role === 'instructor') {
      const myCourses = db.prepare('SELECT * FROM courses WHERE instructor_id = ?').all(userId);
      const courseIds = myCourses.map(c => c.id);
      const totalStudents = db.prepare(`
        SELECT COUNT(DISTINCT e.user_id) as cnt FROM enrollments e WHERE e.course_id IN (${courseIds.map(() => '?').join(',')})
      `).all(...courseIds)[0]?.cnt || 0;

      const totalRevenue = db.prepare(`
        SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p
        WHERE p.course_id IN (${courseIds.map(() => '?').join(',')}) AND p.status = 'completed'
      `).all(...courseIds)[0]?.total || 0;

      const completedCount = db.prepare(`
        SELECT COUNT(*) as cnt FROM enrollments e WHERE e.course_id IN (${courseIds.map(() => '?').join(',')}) AND e.completed = 1
      `).all(...courseIds)[0]?.cnt || 0;

      return res.json({
        success: true,
        data: {
          role: 'instructor',
          stats: { totalCourses: myCourses.length, totalStudents, totalRevenue, completionRate: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0 }
        }
      });
    }

    if (role === 'admin' || role === 'super_admin') {
      const totalStudents = db.prepare('SELECT COUNT(*) as cnt FROM users WHERE role = ?').get('student').cnt;
      const totalCourses = db.prepare('SELECT COUNT(*) as cnt FROM courses').get().cnt;
      const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'").get().total;
      const completedEnrollments = db.prepare('SELECT COUNT(*) as cnt FROM enrollments WHERE completed = 1').get().cnt;
      const totalEnrollments = db.prepare('SELECT COUNT(*) as cnt FROM enrollments').get().cnt;
      const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

      const recentEnrollments = db.prepare(`
        SELECT e.id, u.name as student, c.title as course, e.enrolled_at as date, p.amount as amount
        FROM enrollments e
        JOIN users u ON u.id = e.user_id
        JOIN courses c ON c.id = e.course_id
        LEFT JOIN payments p ON p.course_id = c.id AND p.user_id = u.id
        ORDER BY e.enrolled_at DESC
        LIMIT 10
      `).all();

      res.json({
        success: true,
        data: {
          role: role === 'super_admin' ? 'super_admin' : 'admin',
          stats: { totalStudents, activeCourses: totalCourses, monthlyRevenue: totalRevenue, completionRate, totalRevenue },
          recentEnrollments
        }
      });
    }

    res.json({ success: true, data: { role, stats: {} } });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
