import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ICOLaunchpad factory contract...");

  const signers = await ethers.getSigners();
  
  if (signers.length === 0) {
    console.error("\n❌ ERROR: No deployer account found!");
    console.error("Please create a .env file in the contracts folder with:");
    console.error("PRIVATE_KEY=your_private_key_here");
    console.error("\nMake sure your private key does NOT include the '0x' prefix.");
    process.exit(1);
  }

  const deployer = signers[0];
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("\n❌ ERROR: Deployer account has no ETH!");
    console.error("Please fund your account with Base Sepolia ETH from:");
    console.error("https://www.alchemy.com/faucets/base-sepolia");
    process.exit(1);
  }

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
