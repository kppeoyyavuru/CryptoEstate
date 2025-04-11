import { query } from '../lib/db';

async function addProperties() {
  try {
    // First, create the table if it doesn't exist
    await query(`
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

    // Sample properties
    const properties = [
      {
        name: "Luxury Villa in Miami",
        symbol: "MIAMI1",
        propertyValue: 100,
        totalShares: 1000,
        availableShares: 1000,
        minInvestment: 0.1,
        location: "Miami, Florida",
        description: "Luxurious beachfront villa with 5 bedrooms, private pool, and direct beach access. Perfect for high-end vacation rentals.",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop",
        riskLevel: "Medium",
        expectedReturn: "12%",
        blockchainId: "1",
        isFundingComplete: false
      },
      {
        name: "Downtown NYC Apartment",
        symbol: "NYC1",
        propertyValue: 80,
        totalShares: 800,
        availableShares: 800,
        minInvestment: 0.1,
        location: "Manhattan, New York",
        description: "Modern apartment in the heart of Manhattan. High rental demand with excellent appreciation potential.",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
        riskLevel: "Low",
        expectedReturn: "8%",
        blockchainId: "2",
        isFundingComplete: false
      },
      {
        name: "Tech Hub Office Space",
        symbol: "SFO1",
        propertyValue: 150,
        totalShares: 1500,
        availableShares: 1500,
        minInvestment: 0.2,
        location: "San Francisco, California",
        description: "Prime office space in San Francisco's tech district. Long-term lease potential with established tech companies.",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
        riskLevel: "High",
        expectedReturn: "15%",
        blockchainId: "3",
        isFundingComplete: false
      }
    ];

    // Insert properties
    for (const property of properties) {
      await query(
        `INSERT INTO properties (
          name, symbol, "propertyValue", "totalShares", "availableShares",
          "minInvestment", location, description, image, "riskLevel",
          "expectedReturn", "blockchainId", "isFundingComplete"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING`,
        [
          property.name,
          property.symbol,
          property.propertyValue,
          property.totalShares,
          property.availableShares,
          property.minInvestment,
          property.location,
          property.description,
          property.image,
          property.riskLevel,
          property.expectedReturn,
          property.blockchainId,
          property.isFundingComplete
        ]
      );
    }

    console.log('Sample properties added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding properties:', error);
    process.exit(1);
  }
}

// Run the function
addProperties(); 