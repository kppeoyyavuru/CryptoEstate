const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const properties = [
  {
    name: "Downtown Luxury Apartment",
    symbol: "DLA",
    propertyValue: 0.5,
    totalShares: 1000,
    minInvestment: 0.001,
    propertyURI: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    location: "New York",
    description: "Luxury apartment complex in downtown Manhattan",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    riskLevel: "Medium",
    expectedReturn: "12%"
  },
  {
    name: "Beachfront Villa",
    symbol: "BFV",
    propertyValue: 2.3,
    totalShares: 800,
    minInvestment: 0.001,
    propertyURI: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    location: "Miami",
    description: "Luxurious beachfront villa with ocean views",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    riskLevel: "High",
    expectedReturn: "15%"
  },
  {
    name: "Urban Micro-Loft",
    symbol: "UML",
    propertyValue: 0.75,
    totalShares: 500,
    minInvestment: 0.001,
    propertyURI: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    location: "San Francisco",
    description: "Modern micro-lofts in the heart of the city",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    riskLevel: "Low",
    expectedReturn: "8%"
  },
  {
    name: "Mixed-Use Development",
    symbol: "MUD",
    propertyValue: 1.2,
    totalShares: 1200,
    minInvestment: 0.001,
    propertyURI: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    location: "Austin",
    description: "Mixed-use development with retail and residential spaces",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    riskLevel: "Medium",
    expectedReturn: "10%"
  },
  {
    name: "Commercial Office Space",
    symbol: "COS",
    propertyValue: 3.5,
    totalShares: 1500,
    minInvestment: 0.001,
    propertyURI: "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    location: "Chicago",
    description: "Prime commercial office space in business district",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    riskLevel: "Low",
    expectedReturn: "9%"
  }
];

async function main() {
  try {
    // Clear existing properties from database
    console.log('Clearing existing properties...');
    await prisma.property.deleteMany({});

    console.log('Creating properties in database...');
    for (const property of properties) {
      try {
        console.log(`Creating property: ${property.name}`);
        
        // Create in database
        await prisma.property.create({
          data: {
            name: property.name,
            symbol: property.symbol,
            propertyValue: property.propertyValue,
            totalShares: property.totalShares,
            availableShares: property.totalShares,
            minInvestment: property.minInvestment,
            propertyURI: property.propertyURI,
            isFundingComplete: false,
            location: property.location,
            description: property.description,
            image: property.image,
            riskLevel: property.riskLevel,
            expectedReturn: property.expectedReturn
          }
        });
        
        console.log(`Property created in database: ${property.name}`);
      } catch (error) {
        console.error(`Error creating property ${property.name}:`, error);
      }
    }

    console.log('Database population complete!');
  } catch (error) {
    console.error('Error in population script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 