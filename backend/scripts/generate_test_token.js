const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { query } = require('../src/models/db');

async function gen() {
    const phone = process.argv[2];
    if (!phone) { console.log("No phone"); process.exit(1); }

    const res = await query("SELECT * FROM users WHERE phone = $1", [phone]);
    if (res.rows.length === 0) { console.log("User not found"); process.exit(1); }

    const user = res.rows[0];
    const token = jwt.sign(
        { sub: user.id, email: user.email, role_id: user.role_id, slope_id: user.slope_id, phone },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    console.log(token);
    process.exit(0);
}
gen();
