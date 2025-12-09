const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../src/models/db');

async function seedAlerts() {
  try {
    console.log('Seeding demo alerts...');

    // Insert sample alerts
    const alerts = [
      {
        slope_id: null,
        alert_type: 'sos',
        message: '🚨 SOS Alert: Landslide detected in Zone A with accelerating movement patterns',
        severity: 'critical',
      },
      {
        slope_id: null,
        alert_type: 'threshold',
        message: '⚠️ High-Risk Alert: Moisture levels exceed safe threshold in monitoring zone',
        severity: 'high',
      },
      {
        slope_id: null,
        alert_type: 'system',
        message: '📊 System Alert: Sensor calibration recommended for better accuracy',
        severity: 'medium',
      },
    ];

    for (const alert of alerts) {
      await query(
        `INSERT INTO alerts (slope_id, alert_type, message, severity, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [alert.slope_id, alert.alert_type, alert.message, alert.severity]
      );
      console.log('✅ Alert created:', alert.message.substring(0, 50) + '...');
    }

    // Also insert a government advisory
    await query(
      `INSERT INTO advisories (title, message, issued_by, severity, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        'Government Advisory',
        '📢 Official Advisory: Heavy rainfall expected in the region. Increase monitoring frequency.',
        'Ministry of Mines',
        'high'
      ]
    );
    console.log('✅ Government advisory created');

    console.log('\n✅ All demo alerts seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding alerts:', error.message);
    process.exit(1);
  }
}

seedAlerts();
