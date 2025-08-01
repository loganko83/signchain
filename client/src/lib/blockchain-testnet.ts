// Real blockchain testnet utilities
import { API_BASE_URL } from './api';

export interface NetworkInfo {
  name: string;
  config: {
    name: string;
    rpcUrl: string;
    chainId: number;
    explorerUrl: string;
    gasPrice: string;
  };
  walletAddress: string;
}

export interface TestnetStatus {
  [networkName: string]: {
    connected: boolean;
    error?: string;
    chainId?: number;
    blockNumber?: number;
    walletAddress?: string;
    balance?: string;
    config: {
      name: string;
      rpcUrl: string;
      chainId: number;
      explorerUrl: string;
      gasPrice: string;
    };
  };
}

export interface DocumentRegistration {
  documentHash: string;
  metadata: {
    filename: string;
    fileSize: number;
    timestamp: string;
  };
  network?: string;
}

export interface SignatureRegistration {
  documentHash: string;
  signatureData: string;
  signerAddress: string;
  timestamp: string;
  network?: string;
}

// API Functions
export async function getTestnetStatus(): Promise<TestnetStatus> {
  const response = await fetch(`${API_BASE_URL}/blockchain-testnet/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch testnet status');
  }
  const result = await response.json();
  return result.data;
}

export async function getAvailableNetworks(): Promise<NetworkInfo[]> {
  const response = await fetch(`${API_BASE_URL}/blockchain-testnet/networks`);
  if (!response.ok) {
    throw new Error('Failed to fetch available networks');
  }
  const result = await response.json();
  return result.data;
}

export async function getGasPrices(): Promise<Record<string, string>> {
  const response = await fetch(`${API_BASE_URL}/blockchain-testnet/gas-prices`);
  if (!response.ok) {
    throw new Error('Failed to fetch gas prices');
  }
  const result = await response.json();
  return result.data;
}

export async function registerDocument(data: DocumentRegistration): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/blockchain-testnet/register-document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to register document');
  }
  
  return response.json();
}

export async function registerSignature(data: SignatureRegistration): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/blockchain-testnet/register-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to register signature');
  }
  
  return response.json();
}

export async function verifyTransaction(network: string, txHash: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/blockchain-testnet/verify/${network}/${txHash}`);
  if (!response.ok) {
    throw new Error('Failed to verify transaction');
  }
  return response.json();
}

export async function sendTestTransaction(network: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/blockchain-testnet/test-transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ network }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send test transaction');
  }
  
  return response.json();
}

// Utility Functions
export function getExplorerUrl(network: string, txHash: string): string {
  const explorerUrls: Record<string, string> = {
    'xphere-testnet': 'https://explorer.xphere.io',
    'xphere-ankr': 'https://explorer.xphere.io',
    'polygon-mumbai': 'https://mumbai.polygonscan.com',
    'ethereum-sepolia': 'https://sepolia.etherscan.io',
    'bsc-testnet': 'https://testnet.bscscan.com',
  };
  
  const baseUrl = explorerUrls[network] || 'https://explorer.xphere.io';
  return `${baseUrl}/tx/${txHash}`;
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (num === 0) return '0.000';
  if (num < 0.001) return '<0.001';
  return num.toFixed(3);
}

export function getNetworkName(network: string): string {
  const names: Record<string, string> = {
    'xphere-testnet': 'Xphere Testnet',
    'xphere-ankr': 'Xphere (Ankr)',
    'polygon-mumbai': 'Polygon Mumbai',
    'ethereum-sepolia': 'Ethereum Sepolia',
    'bsc-testnet': 'BSC Testnet',
  };
  return names[network] || network;
}
