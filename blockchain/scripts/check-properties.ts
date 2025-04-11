import { ethers } from "hardhat";

async function main() {
  const FACTORY_ADDRESS = "0xec93F3edaE90877Df1259d4DC257bdc882438365";
  const PropertyFactory = await ethers.getContractFactory("PropertyFactory");
  const factory = PropertyFactory.attach(FACTORY_ADDRESS);
  
  try {
    // Get property count using properties array length
    const propertyCount = await factory.getPropertyCount();
    console.log(`Number of properties: ${propertyCount}`);
    
    // List each property
    console.log("\nProperty Details:");
    
    for (let i = 0; i < propertyCount; i++) {
      try {
        const propertyDetails = await factory.getPropertyDetails(i);
        console.log(`\nProperty #${i}:`);
        console.log(`Name: ${propertyDetails.name}`);
        console.log(`Symbol: ${propertyDetails.symbol}`);
        console.log(`Value: ${ethers.formatEther(propertyDetails.propertyValue)} ETH`);
        console.log(`Total Shares: ${propertyDetails.totalShares}`);
        console.log(`Available Shares: ${propertyDetails.availableShares}`);
        console.log(`Min Investment: ${ethers.formatEther(propertyDetails.minInvestment)} ETH`);
        console.log(`Funding Complete: ${propertyDetails.isFundingComplete}`);
        console.log(`Token Address: ${propertyDetails.tokenAddress}`);
      } catch (error) {
        console.error(`Error getting details for property #${i}:`, error);
      }
    }
  } catch (error) {
    console.error("Error getting property count:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 