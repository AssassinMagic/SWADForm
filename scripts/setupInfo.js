const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  console.log("Checking database connection...");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set!");
    return;
  }
  
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        height VARCHAR(50) NOT NULL,
        weight VARCHAR(50) NOT NULL,
        age VARCHAR(10) NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        skate_preference VARCHAR(100) NOT NULL,
        shoe_size VARCHAR(50),
        skating_ability VARCHAR(100) NOT NULL,
        skate_time VARCHAR(50) NOT NULL,
        check_in BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(query);
    console.log("Table 'reservations' created successfully.");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await pool.end();
  }
}

setup();
