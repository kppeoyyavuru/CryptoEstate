const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_62NPSLfJITRe@ep-proud-heart-a5vtdjhr-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

async function addProperties() {
  try {
    // Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        "propertyValue" DECIMAL NOT NULL,
        "totalShares" INTEGER NOT NULL,
        "availableShares" INTEGER NOT NULL,
        "minInvestment" DECIMAL NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        "riskLevel" VARCHAR(50) NOT NULL,
        "expectedReturn" VARCHAR(50) NOT NULL,
        "blockchainId" VARCHAR(255),
        "isFundingComplete" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert properties
    await pool.query(`
      INSERT INTO properties (
        name, symbol, "propertyValue", "totalShares", "availableShares",
        "minInvestment", location, description, image, "riskLevel",
        "expectedReturn", "blockchainId", "isFundingComplete"
      ) VALUES 
      (
        'Luxury Villa in Miami',
        'MIAMI1',
        100,
        1000,
        1000,
        0.1,
        'Miami, Florida',
        'Luxurious beachfront villa with 5 bedrooms, private pool, and direct beach access. Perfect for high-end vacation rentals.',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop',
        'Medium',
        '12%',
        '1',
        false
      ),
      (
        'Downtown NYC Apartment',
        'NYC1',
        80,
        800,
        800,
        0.1,
        'Manhattan, New York',
        'Modern apartment in the heart of Manhattan. High rental demand with excellent appreciation potential.',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
        'Low',
        '8%',
        '2',
        false
      ),
      (
        'Tech Hub Office Space',
        'SFO1',
        150,
        1500,
        1500,
        0.2,
        'San Francisco, California',
        'Prime office space in San Francisco''s tech district. Long-term lease potential with established tech companies.',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
        'High',
        '15%',
        '3',
        false
      );
    `);

    console.log('Properties added successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addProperties(); 