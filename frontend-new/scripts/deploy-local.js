// Script to deploy contracts to a local Hardhat network
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  // Get the Contract Factories
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const PropertyFactory = await ethers.getContractFactory("PropertyFactory");

  // Deploy the PropertyFactory
  console.log("Deploying PropertyFactory...");
  const propertyFactory = await PropertyFactory.deploy();
  await propertyFactory.waitForDeployment();
  
  const propertyFactoryAddress = await propertyFactory.getAddress();
  console.log(`PropertyFactory deployed to: ${propertyFactoryAddress}`);

  // Save the contract addresses
  const deploymentInfo = {
    PropertyFactory: propertyFactoryAddress,
  };

  // Write deployment info to a file
  const deploymentPath = path.join(__dirname, "../contracts/deployment.json");
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment info saved to ${deploymentPath}`);

  // Create a few example properties
  console.log("Creating example properties...");
  
  const properties = [
    {
      name: "Downtown Luxury Apartment",
      symbol: "DLA",
      propertyValue: ethers.parseEther("0.5"), // 0.5 ETH
      totalShares: 100,
      minInvestment: ethers.parseEther("0.005"), // 0.005 ETH
      propertyURI: "ipfs://QmXyZ123...",
    },
    {
      name: "Beachfront Villa",
      symbol: "BFV",
      propertyValue: ethers.parseEther("2.3"), // 2.3 ETH
      totalShares: 230,
      minInvestment: ethers.parseEther("0.002"), // 0.002 ETH
      propertyURI: "ipfs://QmAbC456...",
    },
    {
      name: "Urban Micro-Loft",
      symbol: "UML",
      propertyValue: ethers.parseEther("0.75"), // 0.75 ETH
      totalShares: 150,
      minInvestment: ethers.parseEther("0.001"), // 0.001 ETH
      propertyURI: "ipfs://QmDeF789...",
    },
  ];

  // Create each property
  const createdProperties = [];
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    console.log(`Creating property: ${prop.name}`);
    
    const tx = await propertyFactory.createProperty(
      prop.name,
      prop.symbol,
      prop.propertyValue,
      prop.totalShares,
      prop.minInvestment,
      prop.propertyURI
    );
    
    const receipt = await tx.wait();
    console.log(`Property created, transaction hash: ${receipt.hash}`);
    
    createdProperties.push({
      id: i,
      name: prop.name,
      symbol: prop.symbol,
      propertyValue: ethers.formatEther(prop.propertyValue),
      totalShares: prop.totalShares,
      minInvestment: ethers.formatEther(prop.minInvestment),
      propertyURI: prop.propertyURI,
    });
  }

  // Write created properties to a file
  const propertiesPath = path.join(__dirname, "../contracts/properties.json");
  fs.writeFileSync(
    propertiesPath,
    JSON.stringify(createdProperties, null, 2)
  );
  console.log(`Created properties saved to ${propertiesPath}`);

  console.log("Deployment and setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 