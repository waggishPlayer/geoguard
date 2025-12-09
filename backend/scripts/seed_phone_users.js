const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { query } = require('../src/models/db');
const bcrypt = require('bcrypt');

async function seedUsers() {
    try {
        console.log('--- SEEDING PHONE USERS ---');

        // 1. Get Role IDs
        const rolesRes = await query('SELECT * FROM roles');
        const roles = {};
        rolesRes.rows.forEach(r => roles[r.name] = r.id);

        const users = [
            { name: 'Super Admin', phone: '0000000000', password: 'admin123', role: 'super_admin', email: 'super@phone.com' },
            { name: 'Gov Authority', phone: '1111111111', password: 'gov123', role: 'gov_authority', email: 'gov@phone.com' },
            { name: 'Site Admin', phone: '2222222222', password: 'admin123', role: 'site_admin', email: 'site@phone.com', slope_id: 9 },
            { name: 'Field Worker', phone: '9999999999', password: 'worker123', role: 'field_worker', email: 'worker@phone.com', slope_id: 9 }
        ];

        for (const u of users) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(u.password, salt);
            const roleId = roles[u.role];

            // Check if user exists by phone
            const check = await query('SELECT * FROM users WHERE phone = $1', [u.phone]);

            if (check.rows.length === 0) {
                await query(
                    `INSERT INTO users (role_id, name, email, phone, password_hash, slope_id, is_approved)
                      VALUES ($1, $2, $3, $4, $5, $6, true)`,
                    [roleId, u.name, u.email, u.phone, hash, u.slope_id || null]
                );
                console.log(`Created: ${u.name} (${u.phone})`);
            } else {
                await query(
                    `UPDATE users SET password_hash = $1, slope_id = $2, is_approved = true WHERE phone = $3`,
                    [hash, u.slope_id || null, u.phone]
                );
                console.log(`Updated: ${u.name} (${u.phone})`);
            }
        }

        console.log('--- SEEDING COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedUsers();
