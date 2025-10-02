// Smart Contract ABIs and Addresses for Base Network
// TODO: Replace with actual deployed contract addresses

export const CONTRACTS = {
  // Deployed ICO Contracts on Base Sepolia
  KYC_REGISTRY: '0xF06b0Fd011bf979902a43EC85Da70D8291de6906',
  ICO_TOKEN: '0xd8568fA727dee4b440C7d8223F527fEFDAf4b868',
  ICO_SALE: '0x33e32BEBE68f449FACEc29EA9ae8c80C05c6f6bd',
  VESTING_VAULT: '0xd5fEA8258c9B15b5fEB5EBfaE85C169860Fd0c35',
  LIQUIDITY_LOCKER: '0x237234d29c0Ad37A2F2b038362ca78d3f60fd3D5',
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
