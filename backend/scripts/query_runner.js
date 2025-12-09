const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { query } = require('../src/models/db');

async function run() {
    try {
        const sql = process.stdin.read(); // Read from pipe
        if (!sql) return;
        const res = await query(sql.toString().trim());
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

process.stdin.on('data', () => { }); // Verify stream is open
process.stdin.on('end', run);
run();
