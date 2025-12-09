const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { query } = require('../src/models/db');

async function seedDemoMine() {
    try {
        console.log('--- SEEDING DEMO MINE ---');

        // 1. Check if Demo Mine exists
        const existingRes = await query('SELECT * FROM slopes WHERE name = $1', ['Demo Mine']);
        
        if (existingRes.rows.length > 0) {
            console.log(`✅ Demo Mine already exists (ID: ${existingRes.rows[0].id})`);
            process.exit(0);
        }

        // 2. Create Demo Mine
        const res = await query(`
            INSERT INTO slopes (name, description, location, risk_level)
            VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), 'low')
            RETURNING id, name
        `, ['Demo Mine', 'Official Demo Mine for Testing', 11.1022, 79.1564]);

        const demoMineId = res.rows[0].id;
        console.log(`✅ Created: ${res.rows[0].name} (ID: ${demoMineId})`);

        // 3. Create Demo Sensors for this mine
        const sensors = [
            { name: 'Accelerometer X', type: 'accelerometer', unit: 'm/s²' },
            { name: 'Accelerometer Y', type: 'accelerometer', unit: 'm/s²' },
            { name: 'Accelerometer Z', type: 'accelerometer', unit: 'm/s²' },
            { name: 'Displacement', type: 'displacement', unit: 'mm' },
            { name: 'Temperature', type: 'temperature', unit: '°C' }
        ];

        for (const sensor of sensors) {
            const sensorRes = await query(
                `INSERT INTO sensors (slope_id, name, sensor_type, unit, is_active)
                 VALUES ($1, $2, $3, $4, true)
                 RETURNING id`,
                [demoMineId, sensor.name, sensor.type, sensor.unit]
            );
            console.log(`  ✅ Created sensor: ${sensor.name} (ID: ${sensorRes.rows[0].id})`);
        }

        console.log('--- DEMO MINE SEEDING COMPLETE ---');
        console.log(`Demo Mine ID: ${demoMineId}`);
        console.log('Now run: node scripts/seed_phone_users.js');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

seedDemoMine();
