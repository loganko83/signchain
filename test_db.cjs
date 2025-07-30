require('dotenv').config();
const { Pool } = require('pg');

async function testDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        // 테이블 목록 확인
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Existing tables:', tablesResult.rows);

        // 사용자 테이블이 있는지 확인
        const usersTable = tablesResult.rows.find(row => row.table_name === 'users');
        if (usersTable) {
            console.log('Users table exists');
            const usersCount = await pool.query('SELECT COUNT(*) FROM users');
            console.log('Users count:', usersCount.rows[0].count);
        } else {
            console.log('Users table does not exist');
        }

        // 문서 테이블이 있는지 확인  
        const documentsTable = tablesResult.rows.find(row => row.table_name === 'documents');
        if (documentsTable) {
            console.log('Documents table exists');
            const docsCount = await pool.query('SELECT COUNT(*) FROM documents');
            console.log('Documents count:', docsCount.rows[0].count);
        } else {
            console.log('Documents table does not exist');
        }

        await pool.end();
        console.log('Database test completed successfully');
    } catch (error) {
        console.error('Database test failed:', error);
        await pool.end();
    }
}

testDatabase();
