import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ICO contracts to Base...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Get deployment parameters from environment or arguments
  const TOKEN_NAME = process.env.TOKEN_NAME || "ICO Token";
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "ICO";
  const INITIAL_SUPPLY = process.env.INITIAL_SUPPLY || "1000000000"; // 1 billion
  const TOKEN_DECIMALS = process.env.TOKEN_DECIMALS || "18";
  const TOKEN_PRICE = ethers.parseEther(process.env.TOKEN_PRICE || "0.0001"); // Price per token in ETH
  const SOFT_CAP = ethers.parseEther(process.env.SOFT_CAP || "1000");
  const HARD_CAP = ethers.parseEther(process.env.HARD_CAP || "5000");
  const MIN_CONTRIBUTION = ethers.parseEther(process.env.MIN_CONTRIBUTION || "0.1");
  const MAX_CONTRIBUTION = ethers.parseEther(process.env.MAX_CONTRIBUTION || "100");
  
  // Sale times (default: start now, end in 30 days)
  const START_TIME = Math.floor(Date.now() / 1000);
  const END_TIME = START_TIME + (30 * 24 * 60 * 60); // 30 days

  // Deploy Token
  console.log("\n1. Deploying ICOToken...");
  const ICOToken = await ethers.getContractFactory("ICOToken");
  const token = await ICOToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    INITIAL_SUPPLY,
    TOKEN_DECIMALS
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ ICOToken deployed to:", tokenAddress);

  // Deploy Sale Contract
  console.log("\n2. Deploying ICOSale...");
  const ICOSale = await ethers.getContractFactory("ICOSale");
  const sale = await ICOSale.deploy(
    tokenAddress,
    TOKEN_PRICE,
    SOFT_CAP,
    HARD_CAP,
    MIN_CONTRIBUTION,
    MAX_CONTRIBUTION,
    START_TIME,
    END_TIME
  );
  await sale.waitForDeployment();
  const saleAddress = await sale.getAddress();
  console.log("✅ ICOSale deployed to:", saleAddress);

  // Transfer tokens to sale contract
  console.log("\n3. Transferring tokens to sale contract...");
  const saleAllocation = ethers.parseUnits(
    (BigInt(INITIAL_SUPPLY) * BigInt(40) / BigInt(100)).toString(),
    TOKEN_DECIMALS
  ); // 40% for public sale
  
  const transferTx = await token.transfer(saleAddress, saleAllocation);
  await transferTx.wait();
  console.log("✅ Transferred", ethers.formatUnits(saleAllocation, TOKEN_DECIMALS), "tokens to sale contract");

  // Verify deployment
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Token Address:", tokenAddress);
  console.log("Sale Address:", saleAddress);
  console.log("Token Name:", TOKEN_NAME);
  console.log("Token Symbol:", TOKEN_SYMBOL);
  console.log("Total Supply:", INITIAL_SUPPLY);
  console.log("Sale Allocation:", ethers.formatUnits(saleAllocation, TOKEN_DECIMALS));
  console.log("Token Price:", ethers.formatEther(TOKEN_PRICE), "ETH");
  console.log("Soft Cap:", ethers.formatEther(SOFT_CAP), "ETH");
  console.log("Hard Cap:", ethers.formatEther(HARD_CAP), "ETH");
  console.log("Start Time:", new Date(START_TIME * 1000).toISOString());
  console.log("End Time:", new Date(END_TIME * 1000).toISOString());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Verification instructions
  console.log("\n🔍 To verify contracts on BaseScan:");
  console.log(`npx hardhat verify --network base ${tokenAddress} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" ${INITIAL_SUPPLY} ${TOKEN_DECIMALS}`);
  console.log(`npx hardhat verify --network base ${saleAddress} ${tokenAddress} ${TOKEN_PRICE} ${SOFT_CAP} ${HARD_CAP} ${MIN_CONTRIBUTION} ${MAX_CONTRIBUTION} ${START_TIME} ${END_TIME}`);

  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      token: {
        address: tokenAddress,
        name: TOKEN_NAME,
        symbol: TOKEN_SYMBOL,
        supply: INITIAL_SUPPLY,
        decimals: TOKEN_DECIMALS,
      },
      sale: {
        address: saleAddress,
        tokenPrice: TOKEN_PRICE.toString(),
        softCap: SOFT_CAP.toString(),
        hardCap: HARD_CAP.toString(),
        startTime: START_TIME,
        endTime: END_TIME,
      },
    },
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✅ Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
