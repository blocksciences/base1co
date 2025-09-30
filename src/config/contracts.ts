// Smart Contract ABIs and Addresses for Base Network
// TODO: Replace with actual deployed contract addresses

export const CONTRACTS = {
  // Example ICO Contract Address on Base
  ICO_FACTORY: '0x0000000000000000000000000000000000000000',
  
  // Add more contract addresses as needed
  STAKING_CONTRACT: '0x0000000000000000000000000000000000000000',
  GOVERNANCE_TOKEN: '0x0000000000000000000000000000000000000000',
};

// Minimal ABI for ICO Contract
// In production, import the full ABI from your contract build artifacts
export const ICO_ABI = [
  {
    inputs: [],
    name: 'tokenPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fundsRaised',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hardCap',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'contribute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ERC-20 Token ABI (minimal)
export const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
