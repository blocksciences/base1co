import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying LIST Token Complete Platform Suite...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const initialOwner = deployer.address;

  console.log("📋 Deployment Configuration:");
  console.log("  Initial Owner:", initialOwner);
  console.log();

  // 1. Deploy LIST Token
  console.log("1️⃣ Deploying LIST Token...");
  const LISTToken = await ethers.getContractFactory("LISTToken");
  const listToken = await LISTToken.deploy(initialOwner);
  await listToken.waitForDeployment();
  const listTokenAddress = await listToken.getAddress();
  console.log("   ✅ LIST Token deployed to:", listTokenAddress);
  
  const totalSupply = await listToken.totalSupply();
  const symbol = await listToken.symbol();
  const decimals = await listToken.decimals();
  console.log("   📊 Total Supply:", ethers.formatUnits(totalSupply, decimals), symbol);
  console.log();

  // 2. Deploy TierManager
  console.log("2️⃣ Deploying TierManager...");
  const TierManager = await ethers.getContractFactory("TierManager");
  const tierManager = await TierManager.deploy(initialOwner);
  await tierManager.waitForDeployment();
  const tierManagerAddress = await tierManager.getAddress();
  console.log("   ✅ TierManager deployed to:", tierManagerAddress);
  console.log();

  // 3. Deploy StakingVault
  console.log("3️⃣ Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(
    listTokenAddress,
    tierManagerAddress,
    initialOwner
  );
  await stakingVault.waitForDeployment();
  const stakingVaultAddress = await stakingVault.getAddress();
  console.log("   ✅ StakingVault deployed to:", stakingVaultAddress);
  console.log();

  // 4. Deploy FeeDistributor
  console.log("4️⃣ Deploying FeeDistributor...");
  const FeeDistributor = await ethers.getContractFactory("FeeDistributor");
  const feeDistributor = await FeeDistributor.deploy(
    listTokenAddress,
    stakingVaultAddress,
    initialOwner
  );
  await feeDistributor.waitForDeployment();
  const feeDistributorAddress = await feeDistributor.getAddress();
  console.log("   ✅ FeeDistributor deployed to:", feeDistributorAddress);
  console.log();

  // 5. Deploy GovernanceVault
  console.log("5️⃣ Deploying GovernanceVault...");
  const GovernanceVault = await ethers.getContractFactory("GovernanceVault");
  const governanceVault = await GovernanceVault.deploy(
    listTokenAddress,
    tierManagerAddress,
    stakingVaultAddress,
    initialOwner
  );
  await governanceVault.waitForDeployment();
  const governanceVaultAddress = await governanceVault.getAddress();
  console.log("   ✅ GovernanceVault deployed to:", governanceVaultAddress);
  console.log();

  // 6. Configure Authorizations
  console.log("6️⃣ Configuring Contract Authorizations...");
  
  await (await listToken.setAuthorizedContract(stakingVaultAddress, true)).wait();
  console.log("   ✅ StakingVault authorized in LISTToken");
  
  await (await listToken.setAuthorizedContract(feeDistributorAddress, true)).wait();
  console.log("   ✅ FeeDistributor authorized in LISTToken");
  
  await (await tierManager.setAuthorizedUpdater(stakingVaultAddress, true)).wait();
  console.log("   ✅ StakingVault authorized in TierManager");
  
  await (await stakingVault.setTierManager(tierManagerAddress)).wait();
  console.log("   ✅ TierManager set in StakingVault");
  
  await (await stakingVault.setFeeDistributor(feeDistributorAddress)).wait();
  console.log("   ✅ FeeDistributor set in StakingVault");
  
  await (await feeDistributor.setAuthorizedFeeSource(feeDistributorAddress, true)).wait();
  console.log("   ✅ FeeDistributor authorized as fee source");
  console.log();

  // 7. Fund Reward Pool
  console.log("7️⃣ Funding Staking Reward Pool...");
  const rewardAmount = ethers.parseEther("3000000000"); // 3B tokens
  await (await listToken.approve(stakingVaultAddress, rewardAmount)).wait();
  await (await stakingVault.fundRewardPool(rewardAmount)).wait();
  const rewardPool = await stakingVault.rewardPool();
  console.log("   ✅ Reward pool funded:", ethers.formatUnits(rewardPool, decimals), symbol);
  console.log();

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      listToken: listTokenAddress,
      tierManager: tierManagerAddress,
      stakingVault: stakingVaultAddress,
      feeDistributor: feeDistributorAddress,
      governanceVault: governanceVaultAddress,
    },
  };

  const outputPath = path.join(__dirname, "../deployments/list-platform-deployment.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("=" .repeat(80));
  console.log("✨ DEPLOYMENT COMPLETE");
  console.log("=" .repeat(80));
  console.log();
  console.log("LISTToken:        ", listTokenAddress);
  console.log("TierManager:      ", tierManagerAddress);
  console.log("StakingVault:     ", stakingVaultAddress);
  console.log("FeeDistributor:   ", feeDistributorAddress);
  console.log("GovernanceVault:  ", governanceVaultAddress);
  console.log();
  console.log("📁 Deployment info saved to:", outputPath);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
