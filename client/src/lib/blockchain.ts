// Mock blockchain utilities
export function generateMockTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export function generateMockBlockNumber(): number {
  return Math.floor(Math.random() * 1000000) + 1234567;
}

export function getMockGasFee(): string {
  const fees = ['0.001', '0.002', '0.001', '0.003'];
  return fees[Math.floor(Math.random() * fees.length)] + ' XPH';
}

export function getCurrentBlockHeight(): string {
  const baseHeight = 1234567;
  const randomIncrement = Math.floor(Math.random() * 100);
  return (baseHeight + randomIncrement).toLocaleString();
}

export interface BlockchainStatus {
  isConnected: boolean;
  blockHeight: string;
  gasFee: string;
  network: string;
}

export function getBlockchainStatus(): BlockchainStatus {
  return {
    isConnected: true,
    blockHeight: getCurrentBlockHeight(),
    gasFee: getMockGasFee(),
    network: "Xphere Mainnet",
  };
}
