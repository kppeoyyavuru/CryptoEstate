import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed database...')

  // Clean up existing properties
  await prisma.investment.deleteMany({})
  await prisma.property.deleteMany({})

  // Properties from PropertiesList.tsx
  const properties = [
    {
      id: "0",
      name: "Downtown Luxury Apartment",
      symbol: "DLA",
      propertyValue: 0.5,
      totalShares: 100,
      availableShares: 35,
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
      availableShares: 115,
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
      availableShares: 0,
      minInvestment: 0.001,
      location: "Chicago, IL",
      description: "Modern micro-apartments in the heart of the city, perfect for young professionals.",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
      riskLevel: "Low",
      expectedReturn: "8-12%",
      propertyURI: "ipfs://QmDeF789...",
      tokenAddress: "0x3456789012345678901234567890123456789012",
      isFundingComplete: true
    },
    {
      id: "3",
      name: "Mixed-Use Development",
      symbol: "MUD",
      propertyValue: 1.2,
      totalShares: 200,
      availableShares: 80,
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
      availableShares: 175,
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
  ]

  // Create properties
  for (const property of properties) {
    await prisma.property.create({
      data: property
    })
  }

  console.log('Seeding completed successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error while seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 