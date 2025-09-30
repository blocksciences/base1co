// Utility functions for formatting blockchain data

/**
 * Format an Ethereum address to a shortened version
 * @param address - The full Ethereum address
 * @param chars - Number of characters to show at start and end (default: 4)
 * @returns Formatted address like "0x1234...5678"
 */
export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format a large number with appropriate suffix (K, M, B)
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number like "1.5M"
 */
export const formatNumber = (num: number, decimals = 2): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
};

/**
 * Format a token amount from wei to human-readable format
 * @param amount - The amount in wei
 * @param decimals - Token decimals (default: 18)
 * @param displayDecimals - Number of decimals to display (default: 4)
 * @returns Formatted token amount
 */
export const formatTokenAmount = (
  amount: bigint,
  decimals = 18,
  displayDecimals = 4
): string => {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  const truncatedFractional = fractionalString.slice(0, displayDecimals);
  
  return `${integerPart}.${truncatedFractional}`;
};

/**
 * Format USD value
 * @param value - The value to format
 * @returns Formatted USD value like "$1,234.56"
 */
export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a timestamp to a relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string like "2 hours ago"
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
};

/**
 * Format a percentage
 * @param value - The percentage value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage like "12.34%"
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Generate a transaction URL for the Base network
 * @param txHash - Transaction hash
 * @param isTestnet - Whether to use testnet explorer (default: false)
 * @returns URL to the transaction on BaseScan
 */
export const getTxUrl = (txHash: string, isTestnet = false): string => {
  const baseUrl = isTestnet 
    ? 'https://sepolia.basescan.org' 
    : 'https://basescan.org';
  return `${baseUrl}/tx/${txHash}`;
};

/**
 * Generate an address URL for the Base network
 * @param address - Ethereum address
 * @param isTestnet - Whether to use testnet explorer (default: false)
 * @returns URL to the address on BaseScan
 */
export const getAddressUrl = (address: string, isTestnet = false): string => {
  const baseUrl = isTestnet 
    ? 'https://sepolia.basescan.org' 
    : 'https://basescan.org';
  return `${baseUrl}/address/${address}`;
};
