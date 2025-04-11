import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Creating properties with the account:", deployer.address);

  // Get the deployed contract
  const FACTORY_ADDRESS = "0xec93F3edaE90877Df1259d4DC257bdc882438365";
  const PropertyFactory = await ethers.getContractFactory("PropertyFactory");
  const propertyFactory = PropertyFactory.attach(FACTORY_ADDRESS);

  // Sample properties to create
  const properties = [
    {
      name: "Luxury Apartment Complex",
      symbol: "LAC",
      propertyValue: ethers.parseEther("3.5"), // 3.5 ETH
      totalShares: 1000,
      minInvestment: ethers.parseEther("0.001"), // 0.001 ETH
      propertyURI: "ipfs://QmYZU8SoMtsV8YVuLfs5Eba4YGwZtssJAGDHZU1QPXPfF2"
    },
    {
      name: "Commercial Office Space",
      symbol: "COS",
      propertyValue: ethers.parseEther("5.0"), // 5.0 ETH
      totalShares: 1500,
      minInvestment: ethers.parseEther("0.001"), // 0.001 ETH
      propertyURI: "ipfs://QmYBuVePXPfF2YVuLfs5Eba4YGwZtsHZU1QPsJAGDsJXA8"
    },
    {
      name: "Beachfront Villa",
      symbol: "BFV",
      propertyValue: ethers.parseEther("8.0"), // 8.0 ETH
      totalShares: 2000,
      minInvestment: ethers.parseEther("0.001"), // 0.001 ETH
      propertyURI: "ipfs://QmPXsJAGDHZU1QYBuVeYGwZts5Eba4fs8YVuLXA"
    }
  ];

  // Create each property
  for (const property of properties) {
    console.log(`Creating property: ${property.name} (${property.symbol})`);
    
    try {
      const tx = await propertyFactory.createProperty(
        property.name,
        property.symbol,
        property.propertyValue,
        property.totalShares,
        property.minInvestment,
        property.propertyURI
      );
      
      const receipt = await tx.wait();
      console.log(`Property created! Transaction: ${receipt.hash}`);
      
      // Get the property ID and token address from the event
      // Find the PropertyTokenCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsedLog = propertyFactory.interface.parseLog(log);
          return parsedLog && parsedLog.name === "PropertyTokenCreated";
        } catch (e) {
          return false;
        }
      });
      
      if (event) {
        const parsedEvent = propertyFactory.interface.parseLog(event);
        const propertyId = parsedEvent.args[0];
        const tokenAddress = parsedEvent.args[1];
        console.log(`Property ID: ${propertyId}`);
        console.log(`Token Address: ${tokenAddress}`);
      }
      
      // Wait a bit between transactions
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Error creating property ${property.name}:`, error);
    }
  }

  console.log("Properties created successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 