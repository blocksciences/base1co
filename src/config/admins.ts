// ADMIN WALLET ADDRESSES
// Only these wallet addresses have admin access to the platform
// Add or remove addresses as needed

export const ADMIN_ADDRESSES = [
  // Add your admin wallet addresses here (lowercase)
  '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
  '0x853d955acef822db058eb8505911ed77f175b99e',
  // Add more admin addresses as needed
];

/**
 * Check if a wallet address has admin privileges
 * @param address - Wallet address to check
 * @returns boolean indicating if address is an admin
 */
export const isAdmin = (address: string | undefined): boolean => {
  if (!address) return false;
  return ADMIN_ADDRESSES.includes(address.toLowerCase());
};
