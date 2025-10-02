import { ethers } from "hardhat";

async function main() {
  // The address to authorize
  const DEPLOYER_ADDRESS = "0x42b8c0eCC3E000af532f36f2fD0Cf42a26EfDf9C";
  
  // Hardcoded launchpad address
  const LAUNCHPAD_ADDRESS = "0x264daDF84f470c650dCCcb2f5670AFD48a6E7C33";

  console.log("Authorizing deployer on ICOLaunchpad...");
  console.log("Launchpad address:", LAUNCHPAD_ADDRESS);
  console.log("Deployer to authorize:", DEPLOYER_ADDRESS);

  // Get the signer (must be the owner of the launchpad)
  const [signer] = await ethers.getSigners();
  console.log("Calling from:", signer.address);

  // Get the contract
  const launchpad = await ethers.getContractAt("ICOLaunchpad", LAUNCHPAD_ADDRESS);

  // Check current owner
  const owner = await launchpad.owner();
  console.log("Current owner:", owner);

  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Signer ${signer.address} is not the owner ${owner}`);
  }

  // Check if already authorized
  const isAuthorized = await launchpad.authorizedDeployers(DEPLOYER_ADDRESS);
  if (isAuthorized) {
    console.log("✅ Address is already authorized!");
    return;
  }

  // Authorize the deployer
  console.log("Sending authorization transaction...");
  const tx = await launchpad.authorizeDeployer(DEPLOYER_ADDRESS);
  console.log("Transaction hash:", tx.hash);

  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("✅ Deployer authorized successfully!");

  // Verify
  const isNowAuthorized = await launchpad.authorizedDeployers(DEPLOYER_ADDRESS);
  console.log("Authorization confirmed:", isNowAuthorized);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
