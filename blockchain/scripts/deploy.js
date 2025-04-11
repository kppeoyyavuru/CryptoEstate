// Deployment script for CryptoEstates contracts - LOCAL NETWORK
const hre = require("hardhat");

async function main() {
  console.log("Deploying CryptoEstates contracts to local network...");
  
  // Get the deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  
  // Deploy PropertyFactory
  console.log("Deploying PropertyFactory...");
  const PropertyFactory = await hre.ethers.getContractFactory("PropertyFactory");
  const propertyFactory = await PropertyFactory.deploy(deployer.address);
  await propertyFactory.waitForDeployment();
  
  // Get the deployed contract address
  const propertyFactoryAddress = await propertyFactory.getAddress();
  console.log("PropertyFactory deployed to:", propertyFactoryAddress);
  
  // Create sample properties for testing
  console.log("Creating sample properties...");
  
  const properties = [
    {
      name: "Luxury Apartment Complex",
      symbol: "LUXAPT",
      propertyValue: hre.ethers.parseEther("3.5"),  // 3.5 ETH
      totalShares: 1000,
      minInvestment: hre.ethers.parseEther("0.001"), // 0.001 ETH
      propertyURI: "ipfs://QmW8jbKmUQ6tTtGD6U61HfkVdBFPcPZJxj2JpGUFz1vpTR/1"
    },
    {
      name: "Commercial Office Space",
      symbol: "COMOFF",
      propertyValue: hre.ethers.parseEther("5.2"),  // 5.2 ETH
      totalShares: 1500,
      minInvestment: hre.ethers.parseEther("0.001"), // 0.001 ETH
      propertyURI: "ipfs://QmW8jbKmUQ6tTtGD6U61HfkVdBFPcPZJxj2JpGUFz1vpTR/2"
    },
    {
      name: "Residential Duplex",
      symbol: "RESDPX",
      propertyValue: hre.ethers.parseEther("1.8"),  // 1.8 ETH
      totalShares: 800,
      minInvestment: hre.ethers.parseEther("0.001"), // 0.001 ETH
      propertyURI: "ipfs://QmW8jbKmUQ6tTtGD6U61HfkVdBFPcPZJxj2JpGUFz1vpTR/3"
    },
    {
      name: "Vacation Rental Property",
      symbol: "VACRNT",
      propertyValue: hre.ethers.parseEther("2.3"),  // 2.3 ETH
      totalShares: 700,
      minInvestment: hre.ethers.parseEther("0.001"), // 0.001 ETH
      propertyURI: "ipfs://QmW8jbKmUQ6tTtGD6U61HfkVdBFPcPZJxj2JpGUFz1vpTR/4"
    }
  ];
  
  // Create properties on-chain
  for (const property of properties) {
    console.log(`Creating property: ${property.name}...`);
    const tx = await propertyFactory.createProperty(
      property.name,
      property.symbol,
      property.propertyValue,
      property.totalShares,
      property.minInvestment,
      property.propertyURI
    );
    await tx.wait();
    console.log(`Property ${property.name} created successfully`);
  }
  
  console.log("All properties created successfully!");
  
  // Write the contract addresses to a file
  const fs = require("fs");
  const contractsDir = "../frontend-new/app/blockchain";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  // Save contract data
  const contractData = {
    propertyFactoryAddress: propertyFactoryAddress,
    network: "localhost",
    chainId: 1337,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    contractsDir + "/contracts.json",
    JSON.stringify(contractData, null, 2)
  );
  
  // Save to console for easy copy-paste
  console.log("\n---CONTRACT DEPLOYMENT INFO---");
  console.log(JSON.stringify(contractData, null, 2));
  console.log("--------------------------------\n");
  
  console.log("Contract addresses written to frontend");
  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 