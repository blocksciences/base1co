import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying LIST Token Platform...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Get allocation addresses from environment or use deployer as fallback
  const stakingRewardsAddress = process.env.STAKING_REWARDS_ADDRESS || deployer.address;
  const teamAddress = process.env.TEAM_ADDRESS || deployer.address;
  const liquidityAddress = process.env.LIQUIDITY_ADDRESS || deployer.address;
  const ecosystemAddress = process.env.ECOSYSTEM_ADDRESS || deployer.address;

  console.log("📋 Deployment Configuration:");
  console.log("  Staking Rewards Address:", stakingRewardsAddress);
  console.log("  Team Address:", teamAddress);
  console.log("  Liquidity Address:", liquidityAddress);
  console.log("  Ecosystem Address:", ecosystemAddress);
  console.log();

  // Deploy LIST Token
  console.log("1️⃣ Deploying LIST Token...");
  const LISTToken = await ethers.getContractFactory("LISTToken");
  const listToken = await LISTToken.deploy(
    stakingRewardsAddress,
    teamAddress,
    liquidityAddress,
    ecosystemAddress
  );
  await listToken.waitForDeployment();
  const listTokenAddress = await listToken.getAddress();
  console.log("   ✅ LIST Token deployed to:", listTokenAddress);

  // Verify token details
  const totalSupply = await listToken.totalSupply();
  const symbol = await listToken.symbol();
  const decimals = await listToken.decimals();
  console.log("   📊 Token Details:");
  console.log("      Symbol:", symbol);
  console.log("      Decimals:", decimals);
  console.log("      Total Supply:", ethers.formatUnits(totalSupply, decimals), symbol);
  console.log();

  // Deploy Staking Vault
  console.log("2️⃣ Deploying Platform Staking Vault...");
  const PlatformStakingVault = await ethers.getContractFactory("PlatformStakingVault");
  const stakingVault = await PlatformStakingVault.deploy(listTokenAddress);
  await stakingVault.waitForDeployment();
  const stakingVaultAddress = await stakingVault.getAddress();
  console.log("   ✅ Staking Vault deployed to:", stakingVaultAddress);
  console.log();

  // Get allocation amounts
  const stakingAllocation = await listToken.STAKING_REWARDS_ALLOCATION();
  console.log("3️⃣ Token Allocations:");
  console.log("   Staking Rewards:", ethers.formatUnits(stakingAllocation, decimals), symbol);
  console.log("   ICO Participants:", ethers.formatUnits(await listToken.ICO_PARTICIPANTS_ALLOCATION(), decimals), symbol);
  console.log("   Team:", ethers.formatUnits(await listToken.TEAM_ALLOCATION(), decimals), symbol);
  console.log("   Liquidity:", ethers.formatUnits(await listToken.LIQUIDITY_ALLOCATION(), decimals), symbol);
  console.log("   Ecosystem:", ethers.formatUnits(await listToken.ECOSYSTEM_ALLOCATION(), decimals), symbol);
  console.log();

  // Fund the staking vault reward pool (if deployer controls staking rewards address)
  if (stakingRewardsAddress === deployer.address) {
    console.log("4️⃣ Funding Staking Vault Reward Pool...");
    const stakingBalance = await listToken.balanceOf(stakingRewardsAddress);
    console.log("   Staking rewards wallet balance:", ethers.formatUnits(stakingBalance, decimals), symbol);
    
    // Approve staking vault to spend tokens
    console.log("   Approving staking vault...");
    const approveTx = await listToken.approve(stakingVaultAddress, stakingBalance);
    await approveTx.wait();
    console.log("   ✅ Approved");

    // Fund the reward pool with all staking allocation
    console.log("   Transferring to reward pool...");
    const fundTx = await stakingVault.fundRewardPool(stakingBalance);
    await fundTx.wait();
    console.log("   ✅ Reward pool funded with", ethers.formatUnits(stakingBalance, decimals), symbol);
    
    const rewardPool = await stakingVault.rewardPool();
    console.log("   Reward pool balance:", ethers.formatUnits(rewardPool, decimals), symbol);
    console.log();
  } else {
    console.log("4️⃣ ⚠️  Staking reward pool funding skipped (different address)");
    console.log("   Please manually fund the reward pool by calling:");
    console.log(`   fundRewardPool(amount) on ${stakingVaultAddress}`);
    console.log();
  }

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      listToken: {
        address: listTokenAddress,
        symbol: symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
      },
      stakingVault: {
        address: stakingVaultAddress,
        rewardPool: ethers.formatUnits(await stakingVault.rewardPool(), decimals),
      },
    },
    allocations: {
      stakingRewards: stakingRewardsAddress,
      team: teamAddress,
      liquidity: liquidityAddress,
      ecosystem: ecosystemAddress,
    },
  };

  const outputPath = path.join(__dirname, "../deployments/list-token-deployment.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("📁 Deployment Information Saved:");
  console.log("   File:", outputPath);
  console.log();

  console.log("=" .repeat(80));
  console.log("✨ DEPLOYMENT SUMMARY");
  console.log("=" .repeat(80));
  console.log();
  console.log("LIST Token Address:     ", listTokenAddress);
  console.log("Staking Vault Address:  ", stakingVaultAddress);
  console.log();
  console.log("🔍 Verify contracts on BaseScan:");
  console.log();
  console.log("npx hardhat verify --network baseSepolia", listTokenAddress, 
    stakingRewardsAddress, teamAddress, liquidityAddress, ecosystemAddress);
  console.log();
  console.log("npx hardhat verify --network baseSepolia", stakingVaultAddress, listTokenAddress);
  console.log();
  console.log("=" .repeat(80));
  console.log();
  console.log("⚠️  NEXT STEPS:");
  console.log("1. Update database with contract addresses");
  console.log("2. Verify contracts on BaseScan");
  console.log("3. Update frontend config with addresses");
  if (stakingRewardsAddress !== deployer.address) {
    console.log("4. Fund reward pool from staking rewards address");
  }
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
