const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database fix...');

  try {
    // Execute SQL statements one by one
    console.log('Dropping existing tables...');
    
    try {
      await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "investments";');
      await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "properties";');
      await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "users";');
      
      console.log('Tables dropped successfully');
    } catch (error) {
      console.error('Error dropping tables:', error);
    }

    console.log('Creating users table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "users" (
        "id" TEXT NOT NULL,
        "clerkId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "username" TEXT,
        "phoneNumber" TEXT,
        "metamaskWallet" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('Creating properties table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "properties" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "symbol" TEXT NOT NULL,
        "propertyValue" DOUBLE PRECISION NOT NULL,
        "totalShares" INTEGER NOT NULL,
        "availableShares" INTEGER NOT NULL,
        "minInvestment" DOUBLE PRECISION NOT NULL,
        "location" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "image" TEXT NOT NULL,
        "riskLevel" TEXT NOT NULL,
        "expectedReturn" TEXT NOT NULL,
        "propertyURI" TEXT,
        "tokenAddress" TEXT,
        "isFundingComplete" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('Creating investments table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "investments" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "propertyId" TEXT NOT NULL,
        "amountInvested" DOUBLE PRECISION NOT NULL,
        "walletAddress" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'COMPLETED',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('Creating indexes...');
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");');
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "users_email_key" ON "users"("email");');

    console.log('Adding foreign key constraints...');
    await prisma.$executeRawUnsafe('ALTER TABLE "investments" ADD CONSTRAINT "investments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;');
    await prisma.$executeRawUnsafe('ALTER TABLE "investments" ADD CONSTRAINT "investments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;');

    // Seed the database with properties
    console.log('Seeding properties...');
    
    // Properties from PropertiesList.tsx
    const properties = [
      {
        id: "0",
        name: "Downtown Luxury Apartment",
        symbol: "DLA",
        propertyValue: 0.5,
        totalShares: 100,
        availableShares: 100,
        minInvestment: 0.005,
        location: "New York, NY",
        description: "Prime residential unit in Manhattan's financial district with high rental demand.",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop",
        riskLevel: "Medium",
        expectedReturn: "10-15%",
        propertyURI: "ipfs://QmXyZ123...",
        tokenAddress: "0x1234567890123456789012345678901234567890",
        isFundingComplete: false
      },
      {
        id: "1",
        name: "Beachfront Villa",
        symbol: "BFV",
        propertyValue: 2.3,
        totalShares: 230,
        availableShares: 230,
        minInvestment: 0.002,
        location: "Miami, FL",
        description: "Luxurious beachfront property with panoramic ocean views and private access.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
        riskLevel: "High",
        expectedReturn: "15-20%",
        propertyURI: "ipfs://QmAbC456...",
        tokenAddress: "0x2345678901234567890123456789012345678901",
        isFundingComplete: false
      },
      {
        id: "2",
        name: "Urban Micro-Loft",
        symbol: "UML",
        propertyValue: 0.75,
        totalShares: 150,
        availableShares: 150,
        minInvestment: 0.001,
        location: "Chicago, IL",
        description: "Modern micro-apartments in the heart of the city, perfect for young professionals.",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        riskLevel: "Low",
        expectedReturn: "8-12%",
        propertyURI: "ipfs://QmDeF789...",
        tokenAddress: "0x3456789012345678901234567890123456789012",
        isFundingComplete: false
      },
      {
        id: "3",
        name: "Mixed-Use Development",
        symbol: "MUD",
        propertyValue: 1.2,
        totalShares: 200,
        availableShares: 200,
        minInvestment: 0.003,
        location: "Los Angeles, CA",
        description: "Mixed-use development in a rapidly growing urban area with strong rental income.",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop",
        riskLevel: "Medium",
        expectedReturn: "10-15%",
        propertyURI: "ipfs://QmGhI789...",
        tokenAddress: "0x4567890123456789012345678901234567890123",
        isFundingComplete: false
      },
      {
        id: "4",
        name: "Commercial Office Space",
        symbol: "COS",
        propertyValue: 3.5,
        totalShares: 350,
        availableShares: 350,
        minInvestment: 0.004,
        location: "Dallas, TX",
        description: "Commercial office space in a prime location with long-term corporate tenants.",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop",
        riskLevel: "Low",
        expectedReturn: "8-12%",
        propertyURI: "ipfs://QmJkL012...",
        tokenAddress: "0x5678901234567890123456789012345678901234",
        isFundingComplete: false
      }
    ];

    // Create properties one by one
    for (const property of properties) {
      console.log(`Creating property: ${property.name}`);
      
      // Set timestamps
      property.createdAt = new Date();
      property.updatedAt = new Date();
      
      try {
        await prisma.property.create({
          data: property
        });
        console.log(`Created property: ${property.name}`);
      } catch (error) {
        console.error(`Error creating property ${property.name}:`, error);
      }
    }

    console.log('Database fix completed successfully');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 