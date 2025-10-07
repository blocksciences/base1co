import { ethers } from "hardhat";

async function main() {
  console.log("Deploying complete ICO suite to Base...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  
  // Get initial nonce
  let nonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
  console.log("Starting nonce:", nonce);

  // Get deployment parameters from environment or arguments
  const TOKEN_NAME = process.env.TOKEN_NAME || "ICO Token";
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "ICO";
  const INITIAL_SUPPLY_BASE = process.env.INITIAL_SUPPLY || "1000000"; // Base units (e.g., 1 million)
  const TOKEN_DECIMALS = parseInt(process.env.TOKEN_DECIMALS || "18");
  
  // FIXED: Calculate actual supply with decimals
  const INITIAL_SUPPLY = ethers.parseUnits(INITIAL_SUPPLY_BASE, TOKEN_DECIMALS);
  
  const TOKEN_PRICE = ethers.parseEther(process.env.TOKEN_PRICE || "0.00001"); // Price per token in ETH
  const SOFT_CAP = ethers.parseEther(process.env.SOFT_CAP || "1");
  const HARD_CAP = ethers.parseEther(process.env.HARD_CAP || "10");
  const MIN_CONTRIBUTION = ethers.parseEther(process.env.MIN_CONTRIBUTION || "0.01");
  const MAX_CONTRIBUTION = ethers.parseEther(process.env.MAX_CONTRIBUTION || "5");
  const MAX_PER_WALLET = MAX_CONTRIBUTION; // Same as max contribution now
  const LAUNCHPAD_ADDRESS = process.env.LAUNCHPAD_ADDRESS || "";
  
  // Sale times
  const START_TIME = process.env.START_TIME 
    ? parseInt(process.env.START_TIME) 
    : Math.floor(Date.now() / 1000) + 3600; // Start in 1 hour
  const END_TIME = process.env.END_TIME 
    ? parseInt(process.env.END_TIME)
    : START_TIME + (30 * 24 * 60 * 60); // 30 days from start

  // Validation
  console.log("\n📋 Validating parameters...");
  if (SOFT_CAP >= HARD_CAP) {
    throw new Error("Soft cap must be less than hard cap");
  }
  if (MIN_CONTRIBUTION > MAX_CONTRIBUTION) {
    throw new Error("Min contribution must be <= max contribution");
  }
  if (START_TIME <= Math.floor(Date.now() / 1000)) {
    throw new Error("Start time must be in the future");
  }
  
  console.log("✅ Parameters validated");

  // 1. Deploy KYC Registry
  console.log("\n1. Deploying KYCRegistry...");
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await KYCRegistry.deploy({ nonce: nonce++ });
  await kycRegistry.waitForDeployment();
  const kycAddress = await kycRegistry.getAddress();
  console.log("✅ KYCRegistry deployed to:", kycAddress);

  // 2. Deploy Token - FIXED: Pass base supply, not supply with decimals
  console.log("\n2. Deploying ICOToken...");
  const ICOToken = await ethers.getContractFactory("ICOToken");
  const token = await ICOToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    INITIAL_SUPPLY_BASE, // Pass base amount
    TOKEN_DECIMALS,
    { nonce: nonce++ }
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ ICOToken deployed to:", tokenAddress);
  
  // Verify token supply
  const actualSupply = await token.totalSupply();
  console.log("   Total supply:", ethers.formatUnits(actualSupply, TOKEN_DECIMALS), TOKEN_SYMBOL);

  // 3. Deploy Sale Contract
  console.log("\n3. Deploying ICOSale...");
  const ICOSale = await ethers.getContractFactory("ICOSale");
  const sale = await ICOSale.deploy(
    tokenAddress,
    kycAddress,
    TOKEN_PRICE,
    SOFT_CAP,
    HARD_CAP,
    MIN_CONTRIBUTION,
    MAX_CONTRIBUTION,
    MAX_PER_WALLET,
    START_TIME,
    END_TIME,
    { nonce: nonce++ }
  );
  await sale.waitForDeployment();
  const saleAddress = await sale.getAddress();
  console.log("✅ ICOSale deployed to:", saleAddress);

  // 4. Deploy Vesting Vault
  console.log("\n4. Deploying VestingVault...");
  const VestingVault = await ethers.getContractFactory("VestingVault");
  const vestingVault = await VestingVault.deploy(tokenAddress, { nonce: nonce++ });
  await vestingVault.waitForDeployment();
  const vestingAddress = await vestingVault.getAddress();
  console.log("✅ VestingVault deployed to:", vestingAddress);

  // 5. Deploy Liquidity Locker
  console.log("\n5. Deploying LiquidityLocker...");
  const LiquidityLocker = await ethers.getContractFactory("LiquidityLocker");
  const liquidityLocker = await LiquidityLocker.deploy({ nonce: nonce++ });
  await liquidityLocker.waitForDeployment();
  const liquidityAddress = await liquidityLocker.getAddress();
  console.log("✅ LiquidityLocker deployed to:", liquidityAddress);

  // 6. Transfer tokens to sale contract - FIXED calculation
  console.log("\n6. Transferring tokens to sale contract...");
  const saleAllocation = (INITIAL_SUPPLY * BigInt(40)) / BigInt(100); // 40% for public sale
  
  const transferTx = await token.transfer(saleAddress, saleAllocation, { nonce: nonce++ });
  await transferTx.wait();
  console.log("✅ Transferred", ethers.formatUnits(saleAllocation, TOKEN_DECIMALS), TOKEN_SYMBOL, "to sale contract");
  
  // Verify sale contract balance
  const saleBalance = await token.balanceOf(saleAddress);
  console.log("   Sale contract balance:", ethers.formatUnits(saleBalance, TOKEN_DECIMALS), TOKEN_SYMBOL);

  // 7. Register with launchpad (if address provided)
  let saleId = null;
  if (LAUNCHPAD_ADDRESS && LAUNCHPAD_ADDRESS !== "") {
    console.log("\n7. Registering sale with launchpad...");
    try {
      const launchpad = await ethers.getContractAt("ICOLaunchpad", LAUNCHPAD_ADDRESS);
      
      // Check if we're authorized
      const isAuthorized = await launchpad.isAuthorizedDeployer(deployer.address);
      if (!isAuthorized) {
        console.log("⚠️  Warning: Not authorized on launchpad. Skipping registration.");
        console.log("   Contact launchpad owner to authorize:", deployer.address);
      } else {
        const registerTx = await launchpad.registerSale(
          saleAddress,
          tokenAddress,
          kycAddress,
          vestingAddress,
          liquidityAddress,
          deployer.address
        );
        const receipt = await registerTx.wait();
        
        // Extract saleId from event
        const event = receipt?.logs.find((log: any) => {
          try {
            return launchpad.interface.parseLog(log)?.name === 'SaleDeployed';
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = launchpad.interface.parseLog(event);
          saleId = parsed?.args?.saleId?.toString();
          console.log("✅ Sale registered with ID:", saleId);
        }
      }
    } catch (error: any) {
      console.log("⚠️  Launchpad registration failed:", error.message);
      console.log("   Continuing without launchpad registration...");
    }
  } else {
    console.log("\n7. Skipping launchpad registration (no LAUNCHPAD_ADDRESS provided)");
  }

  // Verify deployment
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("KYC Registry:", kycAddress);
  console.log("Token Address:", tokenAddress);
  console.log("Sale Address:", saleAddress);
  console.log("Vesting Vault:", vestingAddress);
  console.log("Liquidity Locker:", liquidityAddress);
  if (saleId) console.log("Launchpad Sale ID:", saleId);
  console.log("\nToken Configuration:");
  console.log("  Name:", TOKEN_NAME);
  console.log("  Symbol:", TOKEN_SYMBOL);
  console.log("  Decimals:", TOKEN_DECIMALS);
  console.log("  Total Supply:", INITIAL_SUPPLY_BASE, TOKEN_SYMBOL);
  console.log("  Sale Allocation:", ethers.formatUnits(saleAllocation, TOKEN_DECIMALS), TOKEN_SYMBOL);
  console.log("\nSale Configuration:");
  console.log("  Token Price:", ethers.formatEther(TOKEN_PRICE), "ETH");
  console.log("  Soft Cap:", ethers.formatEther(SOFT_CAP), "ETH");
  console.log("  Hard Cap:", ethers.formatEther(HARD_CAP), "ETH");
  console.log("  Min Contribution:", ethers.formatEther(MIN_CONTRIBUTION), "ETH");
  console.log("  Max Contribution:", ethers.formatEther(MAX_CONTRIBUTION), "ETH");
  console.log("  Start Time:", new Date(START_TIME * 1000).toISOString());
  console.log("  End Time:", new Date(END_TIME * 1000).toISOString());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Save deployment info to file
  const fs = require('fs');
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    saleId: saleId,
    contracts: {
      kycRegistry: kycAddress,
      token: {
        address: tokenAddress,
        name: TOKEN_NAME,
        symbol: TOKEN_SYMBOL,
        supply: INITIAL_SUPPLY_BASE,
        decimals: TOKEN_DECIMALS,
      },
      sale: {
        address: saleAddress,
        tokenPrice: TOKEN_PRICE.toString(),
        softCap: SOFT_CAP.toString(),
        hardCap: HARD_CAP.toString(),
        minContribution: MIN_CONTRIBUTION.toString(),
        maxContribution: MAX_CONTRIBUTION.toString(),
        startTime: START_TIME,
        endTime: END_TIME,
      },
      vestingVault: vestingAddress,
      liquidityLocker: liquidityAddress,
    },
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✅ Deployment info saved to deployment-info.json");
  
  console.log("\n🔍 To verify contracts on BaseScan:");
  console.log(`npx hardhat verify --network baseSepolia ${kycAddress}`);
  console.log(`npx hardhat verify --network baseSepolia ${tokenAddress} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" ${INITIAL_SUPPLY_BASE} ${TOKEN_DECIMALS}`);
  console.log(`npx hardhat verify --network baseSepolia ${vestingAddress} ${tokenAddress}`);
  console.log(`npx hardhat verify --network baseSepolia ${liquidityAddress}`);
  
  console.log("\n⚠️  IMPORTANT: Before starting the sale:");
  console.log("1. Approve KYC for allowed participants");
  console.log(`   kycRegistry.setKYCStatus(address, true)`);
  console.log("2. Verify token balance in sale contract");
  console.log("3. Test the sale with a small purchase");
  console.log("4. Monitor gas prices and adjust if needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
