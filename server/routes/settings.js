const express = require('express');
const db = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const defaultSettings = {
  revenueSplit: {
    defaultAdminPercentage: 40,
    defaultInstructorPercentage: 60,
    allowCustomSplits: true
  },
  currency: {
    primary: 'KES',
    supported: ['KES', 'USD', 'NGN', 'GBP', 'EUR']
  },
  payments: {
    paystackPublicKey: '',
    paystackSecretKey: '',
    paystackWebhookSecret: '',
    flutterwavePublicKey: '',
    flutterwaveSecretKey: '',
    enabledMethods: ['paystack'],
    currency: 'KES',
    transactionPrefix: 'PIQ'
  },
  features: {
    socialMediaGrowth: true,
    certificates: true,
    liveClasses: false
  },
  branding: {
    platformName: 'Profound IQ Consulting',
    logoUrl: '/logo.png',
    primaryColor: '#2563eb'
  }
};

// Get settings (public read)
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = { ...defaultSettings };
    
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }
    
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.json({ success: true, data: defaultSettings });
  }
});

// Update settings (admin only)
router.put('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const updates = req.body;
    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    const updateMany = db.transaction((items) => {
      for (const [key, value] of Object.entries(items)) {
        upsert.run(key, JSON.stringify(value));
      }
    });

    updateMany(updates);

    // Return merged settings
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = { ...defaultSettings };
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
