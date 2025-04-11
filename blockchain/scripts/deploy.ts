import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy PropertyFactory
  const PropertyFactory = await ethers.getContractFactory("PropertyFactory");
  const propertyFactory = await PropertyFactory.deploy(deployer.address);
  await propertyFactory.waitForDeployment();

  const propertyFactoryAddress = await propertyFactory.getAddress();
  console.log("PropertyFactory deployed to:", propertyFactoryAddress);

  // Create deployment info
  const deploymentInfo = {
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    propertyFactoryAddress
  };

  // Save deployment info to file
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const networkName = process.env.HARDHAT_NETWORK || "localhost";
  const deploymentPath = path.join(deploymentDir, `${networkName}.json`);
  
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Save deployment info to frontend
  const frontendDir = path.join(__dirname, "../../frontend-new/app/blockchain");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendDir, "contracts.json"),
    JSON.stringify({
      propertyFactory: {
        address: propertyFactoryAddress,
        chainId: deploymentInfo.chainId
      }
    }, null, 2)
  );

  // Copy ABI files
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const abiDir = path.join(frontendDir, "abis");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Copy PropertyFactory ABI
  const propertyFactoryArtifact = require("../artifacts/contracts/PropertyFactory.sol/PropertyFactory.json");
  fs.writeFileSync(
    path.join(abiDir, "PropertyFactory.json"),
    JSON.stringify(propertyFactoryArtifact.abi, null, 2)
  );

  // Copy PropertyToken ABI
  const propertyTokenArtifact = require("../artifacts/contracts/PropertyToken.sol/PropertyToken.json");
  fs.writeFileSync(
    path.join(abiDir, "PropertyToken.json"),
    JSON.stringify(propertyTokenArtifact.abi, null, 2)
  );

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 