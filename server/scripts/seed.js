const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/profound_iq.db';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const { v4: uuidv4 } = require('uuid');

console.log('Seeding database...');

const users = [
  { id: 'u-1', name: 'Stephen Mwihaki', email: 'superadmin@profoundiqconsulting.com', password: bcrypt.hashSync('admin123', 10), role: 'super_admin', phone: '+254 700 000 000', bio: 'Platform administrator' },
  { id: 'u-2', name: 'Admin User', email: 'admin@profoundiqconsulting.com', password: bcrypt.hashSync('admin123', 10), role: 'admin', phone: '+254 711 000 000', bio: 'System administrator' },
  { id: 'u-3', name: 'Dr. Sarah Johnson', email: 'sarah@profoundiqconsulting.com', password: bcrypt.hashSync('instructor123', 10), role: 'instructor', phone: '+254 722 000 000', bio: 'Leadership expert' },
  { id: 'u-4', name: 'John Student', email: 'student@profoundiqconsulting.com', password: bcrypt.hashSync('student123', 10), role: 'student', phone: '+254 733 000 000', bio: 'Eager learner' },
];

const insert = db.prepare('INSERT OR REPLACE INTO users (id, name, email, password, role, phone, bio) VALUES (?, ?, ?, ?, ?, ?, ?)');
for (const u of users) {
  insert.run(u.id, u.name, u.email, u.password, u.role, u.phone, u.bio);
  console.log(`  Seeded user: ${u.email} (${u.role})`);
}

const courses = [
  { id: 'c-1', title: 'Leadership Excellence Program', description: 'Master the art of leadership with proven strategies for team management, decision-making, and organizational growth.', instructor_id: 'u-3', price: 299, currency: 'USD', category: 'Leadership', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', published: 1 },
  { id: 'c-2', title: 'Digital Marketing Mastery', description: 'Learn comprehensive digital marketing strategies including SEO, social media, content marketing, and analytics.', instructor_id: 'u-3', price: 249, currency: 'USD', category: 'Marketing', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', published: 1 },
  { id: 'c-3', title: 'Project Management Professional', description: 'Prepare for PMP certification with comprehensive project management training.', instructor_id: 'u-3', price: 349, currency: 'USD', category: 'Business', thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', published: 1 },
];

const courseInsert = db.prepare('INSERT OR REPLACE INTO courses (id, title, description, instructor_id, price, currency, category, thumbnail, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
for (const c of courses) {
  courseInsert.run(c.id, c.title, c.description, c.instructor_id, c.price, c.currency, c.category, c.thumbnail, c.published);
  console.log(`  Seeded course: ${c.title}`);

  const moduleId = uuidv4();
  db.prepare('INSERT INTO course_modules (id, course_id, title, description, order_index, unlock_rule) VALUES (?, ?, ?, ?, ?, ?)').run(moduleId, c.id, 'Module 1: Foundation', 'Core concepts and fundamentals', 1, 'all_open');

  const lessonId = uuidv4();
  db.prepare('INSERT INTO lessons (id, module_id, course_id, title, description, order_index, duration_minutes, content_type, is_free, total_pages, xp_reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(lessonId, moduleId, c.id, 'Introduction & Overview', 'Get started with the basics', 1, 10, 'text', 1, 2, 20);
  db.prepare('INSERT INTO lesson_pages (id, lesson_id, module_id, course_id, page_number, content, content_type, min_dwell_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), lessonId, moduleId, c.id, 1, '<p>Welcome to this course. In this lesson, we will cover the fundamentals.</p>', 'text', 30);
  db.prepare('INSERT INTO lesson_pages (id, lesson_id, module_id, course_id, page_number, content, content_type, min_dwell_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), lessonId, moduleId, c.id, 2, '<p>By the end of this lesson, you will understand the key concepts.</p>', 'text', 30);

  const lessonId2 = uuidv4();
  db.prepare('INSERT INTO lessons (id, module_id, course_id, title, description, order_index, duration_minutes, content_type, is_free, total_pages, xp_reward) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(lessonId2, moduleId, c.id, 'Core Concepts', 'Deep dive into core topics', 2, 15, 'video', 0, 3, 30);
  db.prepare('INSERT INTO lesson_pages (id, lesson_id, module_id, course_id, page_number, content, content_type, min_dwell_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), lessonId2, moduleId, c.id, 1, '<p>Let us explore the core concepts in detail.</p>', 'text', 45);
  db.prepare('INSERT INTO lesson_pages (id, lesson_id, module_id, course_id, page_number, content, content_type, min_dwell_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), lessonId2, moduleId, c.id, 2, '<p>Understanding these principles is essential for mastery.</p>', 'text', 45);
  db.prepare('INSERT INTO lesson_pages (id, lesson_id, module_id, course_id, page_number, content, content_type, min_dwell_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuidv4(), lessonId2, moduleId, c.id, 3, '<p>Now let us apply these concepts in a practical scenario.</p>', 'quiz', 60);
}

const announcements = [
  { id: 'a-1', title: 'Welcome to Profound IQ', body: 'Explore our leadership and marketing programs. Instructors can now submit new courses for approval.', target_roles: 'all', priority: 'normal', created_by: 'u-1' },
  { id: 'a-2', title: 'Platform Maintenance', body: 'We will run platform maintenance from 2:00 AM to 4:00 AM EAT.', target_roles: 'all', priority: 'high', created_by: 'u-1' },
];

const annInsert = db.prepare('INSERT OR REPLACE INTO announcements (id, title, body, target_roles, priority, created_by) VALUES (?, ?, ?, ?, ?, ?)');
for (const a of announcements) {
  annInsert.run(a.id, a.title, a.body, a.target_roles, a.priority, a.created_by);
  console.log(`  Seeded announcement: ${a.title}`);
}

const notifications = [
  { id: 'n-1', user_id: 'u-4', type: 'enrollment', title: 'Enrollment Confirmed', message: 'You have been enrolled in Leadership Excellence Program.', link: '/courses/c-1' },
  { id: 'n-2', user_id: 'u-4', type: 'achievement', title: 'Achievement Unlocked', message: 'You earned the "First Steps" badge!', link: '/dashboard/student/achievements' },
];

const notifInsert = db.prepare('INSERT OR REPLACE INTO notifications (id, user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?)');
for (const n of notifications) {
  notifInsert.run(n.id, n.user_id, n.type, n.title, n.message, n.link);
  console.log(`  Seeded notification: ${n.title}`);
}

const settings = {
  revenueSplit: { defaultAdminPercentage: 40, defaultInstructorPercentage: 60, allowCustomSplits: true },
  currency: { primary: 'KES', supported: ['KES', 'USD', 'NGN', 'GBP', 'EUR'] },
  payments: { paystackPublicKey: '', paystackSecretKey: '', paystackWebhookSecret: '', flutterwavePublicKey: '', flutterwaveSecretKey: '', enabledMethods: ['paystack'], currency: 'KES', transactionPrefix: 'PIQ' },
  features: { socialMediaGrowth: true, certificates: true, liveClasses: false },
  branding: { platformName: 'Profound IQ Consulting', logoUrl: '/logo.png', primaryColor: '#2563eb' }
};

const settingInsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(settings)) {
  settingInsert.run(key, JSON.stringify(value));
  console.log(`  Seeded setting: ${key}`);
}

console.log('\nDatabase seeded successfully!');
console.log(`  Users: ${users.length}`);
console.log(`  Courses: ${courses.length} (with curriculum)`);
console.log(`  Announcements: ${announcements.length}`);
console.log(`  Notifications: ${notifications.length}`);
console.log(`  Settings: ${Object.keys(settings).length}`);
db.close();
