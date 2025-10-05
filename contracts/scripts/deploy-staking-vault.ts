import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StakingVault...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get LIST token address (should be deployed first)
  const listTokenAddress = process.env.LIST_TOKEN_ADDRESS;
  if (!listTokenAddress) {
    throw new Error("LIST_TOKEN_ADDRESS not set in environment");
  }

  console.log("LIST Token address:", listTokenAddress);

  // Deploy StakingVault
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(
    listTokenAddress,
    deployer.address // initial owner
  );

  await stakingVault.waitForDeployment();
  const vaultAddress = await stakingVault.getAddress();

  console.log("✅ StakingVault deployed to:", vaultAddress);
  console.log("\nInitialized with default pools:");
  console.log("- Pool 0: Flexible (0 days) - 5% APY");
  console.log("- Pool 1: 30 days - 12% APY");
  console.log("- Pool 2: 90 days - 20% APY");
  console.log("- Pool 3: 180 days - 35% APY");
  console.log("- Pool 4: 365 days - 50% APY");

  console.log("\n⚠️  Next steps:");
  console.log("1. Fund the reward pool:");
  console.log(`   stakingVault.fundRewardPool(amount)`);
  console.log("2. Update platform_token_config table:");
  console.log(`   UPDATE platform_token_config SET staking_vault_address = '${vaultAddress}'`);
  console.log("3. Approve LIST tokens for staking");

  // Verify contract on block explorer
  if (process.env.BASESCAN_API_KEY) {
    console.log("\n⏳ Waiting for block confirmations before verification...");
    await stakingVault.deploymentTransaction()?.wait(5);
    
    console.log("Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [listTokenAddress, deployer.address],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }

  return {
    stakingVault: vaultAddress,
    listToken: listTokenAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
