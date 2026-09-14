const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;
  
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL environment variable is required');
  }
  
  pool = new Pool({ connectionString });
  
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
  
  return pool;
}

async function query(sql, params = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function initialize() {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    
    // Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Admin table (passwords)
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT DEFAULT 'business',
        description TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        project_zip_url TEXT DEFAULT '',
        website_url TEXT DEFAULT '',
        published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
    
    // Enquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        business TEXT DEFAULT '',
        message TEXT DEFAULT '',
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
    
    // Visits/Analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        path TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Pricing table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing (
        id SERIAL PRIMARY KEY,
        package_key TEXT UNIQUE NOT NULL,
        package_name TEXT NOT NULL,
        price_text TEXT DEFAULT '',
        suffix TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await client.query('COMMIT');
    console.log('Database tables initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { query, queryOne, initialize, closePool, getPool };
