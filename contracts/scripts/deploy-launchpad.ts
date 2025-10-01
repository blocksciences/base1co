import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ICOLaunchpad factory contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the ICOLaunchpad factory
  console.log("\nDeploying ICOLaunchpad...");
  const ICOLaunchpad = await ethers.getContractFactory("ICOLaunchpad");
  const launchpad = await ICOLaunchpad.deploy();
  await launchpad.waitForDeployment();
  
  const launchpadAddress = await launchpad.getAddress();
  console.log("✅ ICOLaunchpad deployed to:", launchpadAddress);

  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Launchpad Address:", launchpadAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n🔍 To verify on BaseScan:");
  console.log(`npx hardhat verify --network baseSepolia ${launchpadAddress}`);

  console.log("\n⚠️  IMPORTANT: Save this launchpad address to your Supabase secrets:");
  console.log(`Secret Name: ICO_LAUNCHPAD_ADDRESS`);
  console.log(`Secret Value: ${launchpadAddress}`);

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    'launchpad-deployment.json',
    JSON.stringify({
      launchpadAddress,
      network: (await ethers.provider.getNetwork()).name,
      chainId: (await ethers.provider.getNetwork()).chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
    }, null, 2)
  );
  console.log("\n✅ Deployment info saved to launchpad-deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
