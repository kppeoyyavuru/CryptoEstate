// This script deploys the PropertyFactory contract
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment on", hre.network.name, "network...");

  // Deploy PropertyFactory
  console.log("Deploying PropertyFactory contract...");
  const PropertyFactory = await hre.ethers.getContractFactory("PropertyFactory");
  const propertyFactory = await PropertyFactory.deploy();

  console.log("Waiting for deployment transaction to be mined...");
  await propertyFactory.waitForDeployment();
  const propertyFactoryAddress = await propertyFactory.getAddress();

  console.log(`PropertyFactory deployed to: ${propertyFactoryAddress}`);

  // Create a few sample properties for testing
  console.log("Creating sample properties...");

  const ethToWei = (amount) => hre.ethers.parseEther(amount.toString());

  // Create properties
  try {
    console.log("Creating property 1: Downtown Luxury Apartment");
    const tx1 = await propertyFactory.createProperty(
      "Downtown Luxury Apartment", 
      "DLA",
      ethToWei(0.5), // 0.5 ETH property value
      100, // 100 total shares
      ethToWei(0.05), // 0.05 ETH minimum investment
      "ipfs://QmXyZ123..."
    );

    console.log("Waiting for property 1 transaction to be mined...");
    const receipt1 = await tx1.wait();
    console.log("Property 1 created:", receipt1.hash);

    console.log("Creating property 2: Beachfront Villa");
    const tx2 = await propertyFactory.createProperty(
      "Beachfront Villa", 
      "BFV",
      ethToWei(2.3), // 2.3 ETH property value
      230, // 230 total shares
      ethToWei(0.2), // 0.2 ETH minimum investment
      "ipfs://QmAbC456..."
    );

    console.log("Waiting for property 2 transaction to be mined...");
    const receipt2 = await tx2.wait();
    console.log("Property 2 created:", receipt2.hash);

    console.log("Creating property 3: Urban Micro-Loft");
    const tx3 = await propertyFactory.createProperty(
      "Urban Micro-Loft", 
      "UML",
      ethToWei(0.75), // 0.75 ETH property value
      150, // 150 total shares
      ethToWei(0.075), // 0.075 ETH minimum investment
      "ipfs://QmDeF789..."
    );

    console.log("Waiting for property 3 transaction to be mined...");
    const receipt3 = await tx3.wait();
    console.log("Property 3 created:", receipt3.hash);

    console.log("All sample properties created successfully!");
  } catch (error) {
    console.error("Error creating properties:", error);
    console.log("Continuing with deployment...");
  }

  // Update the contracts.json file with new addresses
  try {
    const fs = require("fs");
    const path = require("path");
    const contractsDir = path.join(__dirname, "../app/blockchain");
    
    // Make sure the directory exists
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    
    const contractsConfig = {
      propertyFactory: {
        address: propertyFactoryAddress,
        network: hre.network.name
      }
    };

    const filePath = path.join(contractsDir, "contracts.json");
    fs.writeFileSync(
      filePath,
      JSON.stringify(contractsConfig, null, 2)
    );

    console.log("Updated contracts.json with deployed addresses:", filePath);
  } catch (error) {
    console.error("Error updating contracts.json:", error);
  }

  // Verify contract on Etherscan if not on localhost
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    try {
      console.log("Waiting for block confirmations before verification...");
      // Wait for a few blocks for Etherscan to index the contract
      console.log("Sleeping for 30 seconds before verification...");
      await new Promise(resolve => setTimeout(resolve, 30000));

      console.log("Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: propertyFactoryAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.error("Error verifying contract:", error);
      console.log("You may need to verify the contract manually on Etherscan");
    }
  }

  console.log("Deployment completed successfully!");
  console.log("Contract Address:", propertyFactoryAddress);
  console.log("Network:", hre.network.name);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 