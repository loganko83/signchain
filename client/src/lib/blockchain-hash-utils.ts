// Blockchain hash utilities for generating explorer links and validation

export interface NetworkConfig {
  name: string;
  displayName: string;
  explorerUrl: string;
  nativeCurrency: string;
  chainId: number;
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  xphere: {
    name: 'xphere',
    displayName: 'Xphere Network',
    explorerUrl: 'https://explorer.xphere.io',
    nativeCurrency: 'XPH',
    chainId: 1337
  },
  ethereum: {
    name: 'ethereum',
    displayName: 'Ethereum Mainnet',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: 'ETH',
    chainId: 1
  },
  sepolia: {
    name: 'sepolia', 
    displayName: 'Ethereum Sepolia',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: 'ETH',
    chainId: 11155111
  },
  polygon: {
    name: 'polygon',
    displayName: 'Polygon Mainnet',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: 'MATIC',
    chainId: 137
  },
  mumbai: {
    name: 'mumbai',
    displayName: 'Polygon Mumbai',
    explorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: 'MATIC',
    chainId: 80001
  },
  bsc: {
    name: 'bsc',
    displayName: 'BSC Mainnet',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: 'BNB',
    chainId: 56
  }
};

/**
 * Generate blockchain explorer URL for transaction
 */
export function getExplorerUrl(transactionHash: string, network: string = 'xphere'): string {
  const networkConfig = SUPPORTED_NETWORKS[network.toLowerCase()];
  if (!networkConfig) {
    return SUPPORTED_NETWORKS.xphere.explorerUrl + `/tx/${transactionHash}`;
  }
  
  return `${networkConfig.explorerUrl}/tx/${transactionHash}`;
}

/**
 * Generate blockchain explorer URL for address
 */
export function getAddressExplorerUrl(address: string, network: string = 'xphere'): string {
  const networkConfig = SUPPORTED_NETWORKS[network.toLowerCase()];
  if (!networkConfig) {
    return SUPPORTED_NETWORKS.xphere.explorerUrl + `/address/${address}`;
  }
  
  return `${networkConfig.explorerUrl}/address/${address}`;
}

/**
 * Generate blockchain explorer URL for block
 */
export function getBlockExplorerUrl(blockNumber: number, network: string = 'xphere'): string {
  const networkConfig = SUPPORTED_NETWORKS[network.toLowerCase()];
  if (!networkConfig) {
    return SUPPORTED_NETWORKS.xphere.explorerUrl + `/block/${blockNumber}`;
  }
  
  return `${networkConfig.explorerUrl}/block/${blockNumber}`;
}

/**
 * Validate transaction hash format
 */
export function isValidTransactionHash(hash: string): boolean {
  // Basic validation for Ethereum-style transaction hash
  const hashRegex = /^0x[a-fA-F0-9]{64}$/;
  return hashRegex.test(hash);
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

/**
 * Truncate hash for display
 */
export function truncateHash(hash: string, startLength: number = 6, endLength: number = 4): string {
  if (!hash || hash.length <= startLength + endLength) {
    return hash;
  }
  
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

/**
 * Format gas price from wei to gwei
 */
export function formatGasPrice(gasPriceWei: string | number): string {
  const gwei = typeof gasPriceWei === 'string' 
    ? parseInt(gasPriceWei) / 1e9 
    : gasPriceWei / 1e9;
  
  return `${gwei.toFixed(2)} Gwei`;
}

/**
 * Format gas fee with currency
 */
export function formatGasFee(gasFee: string | number, network: string = 'xphere'): string {
  const networkConfig = SUPPORTED_NETWORKS[network.toLowerCase()];
  const currency = networkConfig?.nativeCurrency || 'XPH';
  
  const fee = typeof gasFee === 'string' ? parseFloat(gasFee) : gasFee;
  return `${fee.toFixed(6)} ${currency}`;
}

/**
 * Get network display name
 */
export function getNetworkDisplayName(network: string): string {
  return SUPPORTED_NETWORKS[network.toLowerCase()]?.displayName || network;
}

/**
 * Generate mock transaction hash for testing
 */
export function generateMockTransactionHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Generate mock block number for testing
 */
export function generateMockBlockNumber(): number {
  return Math.floor(Math.random() * 1000000) + 15000000;
}

/**
 * Convert timestamp to blockchain-friendly format
 */
export function formatBlockchainTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toISOString();
}

/**
 * Calculate transaction age
 */
export function getTransactionAge(timestamp: Date | string): string {
  const now = new Date();
  const txTime = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diffMs = now.getTime() - txTime.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}

/**
 * Check if transaction is recent (within specified minutes)
 */
export function isRecentTransaction(timestamp: Date | string, withinMinutes: number = 10): boolean {
  const now = new Date();
  const txTime = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diffMs = now.getTime() - txTime.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  return diffMinutes <= withinMinutes;
}

/**
 * Generate QR code data for transaction hash
 */
export function generateTransactionQRData(transactionHash: string, network: string = 'xphere'): string {
  const explorerUrl = getExplorerUrl(transactionHash, network);
  return explorerUrl;
}

/**
 * Parse transaction hash from various formats
 */
export function parseTransactionHash(input: string): string | null {
  // Remove whitespace
  const cleaned = input.trim();
  
  // If it's already a valid hash, return it
  if (isValidTransactionHash(cleaned)) {
    return cleaned;
  }
  
  // Try to extract hash from explorer URL
  const hashMatch = cleaned.match(/tx\/([0-9a-fA-F]{64})/);
  if (hashMatch && hashMatch[1]) {
    const hash = '0x' + hashMatch[1];
    if (isValidTransactionHash(hash)) {
      return hash;
    }
  }
  
  return null;
}

/**
 * Estimate gas fee based on network and operation type
 */
export function estimateGasFee(
  operationType: 'document' | 'signature' | 'contract' | 'approval' | 'did',
  network: string = 'xphere'
): { gasLimit: number; estimatedFee: string } {
  const gasLimits = {
    document: 25000,
    signature: 35000,
    contract: 50000,
    approval: 45000,
    did: 55000
  };
  
  const networkConfig = SUPPORTED_NETWORKS[network.toLowerCase()];
  const gasLimit = gasLimits[operationType];
  
  // Mock gas price calculation
  const mockGasPrice = network === 'polygon' || network === 'mumbai' ? 0.0001 : 0.002;
  const estimatedFee = (gasLimit * mockGasPrice).toFixed(6);
  
  return {
    gasLimit,
    estimatedFee: `${estimatedFee} ${networkConfig?.nativeCurrency || 'XPH'}`
  };
}
