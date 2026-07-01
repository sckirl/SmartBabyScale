import mysql from 'mysql2/promise';

// ponytail: One global connection pool. No ORM bloat.
export const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'smartbaby',
    database: process.env.DB_NAME || 'smartbabyscale_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper wrapper
export async function query(sql: string, values?: any[]) {
    const [rows] = await pool.execute(sql, values);
    return rows;
}
