// ADMIN WALLET ADDRESSES
// Only these wallet addresses have admin access to the platform
// Add or remove addresses as needed

export const ADMIN_ADDRESSES = [
  // Add your admin wallet addresses here (lowercase)
  '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
  '0x853d955acef822db058eb8505911ed77f175b99e',
  '0x0d4232146b812e904497f0b221a94a71e616fcef',
  // Add more admin addresses as needed
];

const STORAGE_KEY = 'launchbase_admins';

/**
 * Get all admin addresses (from localStorage if available, fallback to constants)
 */
const getAllAdmins = (): string[] => {
  if (typeof window === 'undefined') return ADMIN_ADDRESSES;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return ADMIN_ADDRESSES;
    }
  }
  return ADMIN_ADDRESSES;
};

/**
 * Check if a wallet address has admin privileges
 * @param address - Wallet address to check
 * @returns boolean indicating if address is an admin
 */
export const isAdmin = (address: string | undefined): boolean => {
  if (!address) return false;
  const admins = getAllAdmins();
  return admins.includes(address.toLowerCase());
};
