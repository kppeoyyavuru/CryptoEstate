const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to reset funding progress...');
  
  try {
    // Get all properties
    const properties = await prisma.$queryRaw`
      SELECT * FROM "properties"
    `;
    
    console.log(`Found ${properties.length} properties to update`);
    
    // Update each property to reset funding progress
    for (const property of properties) {
      console.log(`Resetting funding for property: ${property.name}`);
      
      await prisma.$executeRaw`
        UPDATE "properties"
        SET 
          "availableShares" = "totalShares",
          "isFundingComplete" = false,
          "updatedAt" = NOW()
        WHERE "id" = ${property.id}
      `;
    }
    
    // Delete all investments
    const deletedInvestments = await prisma.$executeRaw`
      DELETE FROM "investments"
      RETURNING *
    `;
    
    console.log(`Deleted all investments`);
    
    console.log('Funding progress reset successful');
  } catch (error) {
    console.error('Error resetting funding progress:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 