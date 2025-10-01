// Compiled contract bytecode and ABIs
// These are generated from the Solidity contracts in contracts/contracts/

export const ICOToken = {
  abi: [
    "constructor(string memory name, string memory symbol, uint256 initialSupply, uint8 tokenDecimals)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function transferOwnership(address newOwner) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
  ],
  // Bytecode will be added after compilation
  bytecode: "0x" // Placeholder - will be replaced
};

export const KYCRegistry = {
  abi: [
    "constructor()",
    "function setKYCStatus(address user, bool approved) external",
    "function isEligible(address user) external view returns (bool)"
  ],
  bytecode: "0x" // Placeholder
};

export const ICOSale = {
  abi: [
    "constructor(address tokenAddress, address kycRegistryAddress, uint256 tokenPrice, uint256 softCap, uint256 hardCap, uint256 minContribution, uint256 maxContribution, uint256 maxPerWallet, uint256 startTime, uint256 endTime)"
  ],
  bytecode: "0x" // Placeholder
};

export const VestingVault = {
  abi: [
    "constructor(address tokenAddress)"
  ],
  bytecode: "0x" // Placeholder
};

export const LiquidityLocker = {
  abi: [
    "constructor()"
  ],
  bytecode: "0x" // Placeholder
};
