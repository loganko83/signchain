import { ethers } from 'ethers';
import Web3 from 'web3';
import { storage } from './storage';

// Blockchain network configurations
const NETWORKS = {
  ethereum: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    gasLimit: 100000,
  },
  polygon: {
    id: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    gasLimit: 100000,
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    gasLimit: 100000,
  },
} as const;

// Smart contract ABI for document verification
const DOCUMENT_REGISTRY_ABI = [
  {
    "inputs": [
      {"name": "documentHash", "type": "bytes32"},
      {"name": "metadata", "type": "string"}
    ],
    "name": "registerDocument",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "inputs": [
      {"name": "documentId", "type": "uint256"},
      {"name": "signatureHash", "type": "bytes32"},
      {"name": "signer", "type": "address"}
    ],
    "name": "addSignature",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [{"name": "documentHash", "type": "bytes32"}],
    "name": "verifyDocument",
    "outputs": [
      {"name": "exists", "type": "bool"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "signatures", "type": "address[]"}
    ],
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "documentId", "type": "uint256"},
      {"indexed": true, "name": "documentHash", "type": "bytes32"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "DocumentRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "documentId", "type": "uint256"},
      {"indexed": true, "name": "signer", "type": "address"},
      {"indexed": false, "name": "signatureHash", "type": "bytes32"}
    ],
    "name": "SignatureAdded",
    "type": "event"
  }
];

export class BlockchainService {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private contractAddresses: Map<number, string> = new Map();

  constructor() {
    this.initializeProviders();
    this.initializeContracts();
  }

  private initializeProviders() {
    for (const [key, network] of Object.entries(NETWORKS)) {
      try {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
        this.providers.set(network.id, provider);
        console.log(`${network.name} 프로바이더 초기화 완료`);
      } catch (error) {
        console.error(`${network.name} 프로바이더 초기화 실패:`, error);
      }
    }
  }

  private initializeContracts() {
    // Set contract addresses for each network
    this.contractAddresses.set(1, process.env.ETHEREUM_CONTRACT_ADDRESS || ''); // Ethereum
    this.contractAddresses.set(137, process.env.POLYGON_CONTRACT_ADDRESS || ''); // Polygon
    this.contractAddresses.set(11155111, process.env.SEPOLIA_CONTRACT_ADDRESS || ''); // Sepolia testnet
  }

  private getProvider(networkId: number): ethers.JsonRpcProvider | null {
    return this.providers.get(networkId) || null;
  }

  private getContract(networkId: number): ethers.Contract | null {
    const provider = this.getProvider(networkId);
    const contractAddress = this.contractAddresses.get(networkId);
    
    if (!provider || !contractAddress) {
      return null;
    }

    return new ethers.Contract(contractAddress, DOCUMENT_REGISTRY_ABI, provider);
  }

  private getSigner(networkId: number): ethers.Wallet | null {
    const provider = this.getProvider(networkId);
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    
    if (!provider || !privateKey) {
      return null;
    }

    return new ethers.Wallet(privateKey, provider);
  }

  async registerDocument(
    documentId: number, 
    documentHash: string, 
    metadata: any,
    networkId: number = 137 // Default to Polygon for lower fees
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const contract = this.getContract(networkId);
      const signer = this.getSigner(networkId);
      
      if (!contract || !signer) {
        return { success: false, error: '블록체인 연결 실패' };
      }

      const contractWithSigner = contract.connect(signer);
      
      // Convert document hash to bytes32
      const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(documentHash));
      
      // Estimate gas
      const gasEstimate = await contractWithSigner.registerDocument.estimateGas(
        hashBytes32,
        JSON.stringify(metadata)
      );
      
      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;
      
      // Get current gas price and add priority fee for faster confirmation
      const feeData = await signer.provider!.getFeeData();
      const maxFeePerGas = feeData.maxFeePerGas! * 110n / 100n; // 10% increase
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas! * 110n / 100n;

      const transaction = await contractWithSigner.registerDocument(
        hashBytes32,
        JSON.stringify(metadata),
        {
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        }
      );

      // Store transaction in database immediately
      await storage.createBlockchainTransaction({
        documentId,
        transactionHash: transaction.hash,
        networkId,
        contractAddress: this.contractAddresses.get(networkId)!,
      });

      console.log(`문서 ${documentId} 블록체인 등록 트랜잭션 전송됨: ${transaction.hash}`);
      
      // Monitor transaction in background
      this.monitorTransaction(transaction.hash, networkId, documentId);

      return { success: true, transactionHash: transaction.hash };
    } catch (error: any) {
      console.error('블록체인 문서 등록 오류:', error);
      return { 
        success: false, 
        error: error.message || '블록체인 등록 중 오류가 발생했습니다' 
      };
    }
  }

  async addSignature(
    documentId: number,
    signatureId: number,
    signatureHash: string,
    signerAddress: string,
    networkId: number = 137
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const contract = this.getContract(networkId);
      const signer = this.getSigner(networkId);
      
      if (!contract || !signer) {
        return { success: false, error: '블록체인 연결 실패' };
      }

      const contractWithSigner = contract.connect(signer);
      
      // Get the on-chain document ID (this would be returned from registerDocument)
      const onChainDocumentId = 1; // This should be retrieved from the document registration
      const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(signatureHash));
      
      const gasEstimate = await contractWithSigner.addSignature.estimateGas(
        onChainDocumentId,
        hashBytes32,
        signerAddress
      );
      
      const gasLimit = gasEstimate * 120n / 100n;
      const feeData = await signer.provider!.getFeeData();
      
      const transaction = await contractWithSigner.addSignature(
        onChainDocumentId,
        hashBytes32,
        signerAddress,
        {
          gasLimit,
          maxFeePerGas: feeData.maxFeePerGas! * 110n / 100n,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas! * 110n / 100n,
        }
      );

      await storage.createBlockchainTransaction({
        documentId,
        signatureId,
        transactionHash: transaction.hash,
        networkId,
        contractAddress: this.contractAddresses.get(networkId)!,
      });

      this.monitorTransaction(transaction.hash, networkId, documentId, signatureId);

      return { success: true, transactionHash: transaction.hash };
    } catch (error: any) {
      console.error('블록체인 서명 추가 오류:', error);
      return { 
        success: false, 
        error: error.message || '블록체인 서명 등록 중 오류가 발생했습니다' 
      };
    }
  }

  async verifyDocument(
    documentHash: string,
    networkId: number = 137
  ): Promise<{ 
    exists: boolean; 
    timestamp?: number; 
    signatures?: string[]; 
    error?: string 
  }> {
    try {
      const contract = this.getContract(networkId);
      
      if (!contract) {
        return { exists: false, error: '블록체인 연결 실패' };
      }

      const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(documentHash));
      const result = await contract.verifyDocument(hashBytes32);
      
      return {
        exists: result[0],
        timestamp: Number(result[1]),
        signatures: result[2],
      };
    } catch (error: any) {
      console.error('블록체인 문서 검증 오류:', error);
      return { 
        exists: false, 
        error: error.message || '블록체인 검증 중 오류가 발생했습니다' 
      };
    }
  }

  private async monitorTransaction(
    transactionHash: string, 
    networkId: number, 
    documentId: number,
    signatureId?: number
  ) {
    try {
      const provider = this.getProvider(networkId);
      if (!provider) return;

      console.log(`트랜잭션 ${transactionHash} 모니터링 시작`);
      
      // Wait for transaction confirmation
      const receipt = await provider.waitForTransaction(transactionHash, 1); // Wait for 1 confirmation
      
      if (receipt) {
        const gasUsed = receipt.gasUsed.toString();
        const gasFee = (receipt.gasUsed * receipt.gasPrice).toString();
        
        await storage.updateBlockchainTransactionStatus(
          transactionHash,
          receipt.status === 1 ? 'confirmed' : 'failed',
          receipt.blockNumber,
          gasUsed,
          gasFee
        );

        console.log(`트랜잭션 ${transactionHash} 확인됨 - 블록: ${receipt.blockNumber}`);
        
        // Send notification about transaction confirmation
        if ((global as any).notificationService) {
          const document = await storage.getDocument(documentId);
          if (document) {
            await (global as any).notificationService.sendNotification(document.uploadedBy, {
              title: '블록체인 트랜잭션 확인',
              message: `문서 "${document.title}"의 블록체인 등록이 완료되었습니다.`,
              type: 'blockchain_confirmation',
              metadata: {
                transactionHash,
                blockNumber: receipt.blockNumber,
                documentId,
                signatureId,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error(`트랜잭션 ${transactionHash} 모니터링 오류:`, error);
      
      await storage.updateBlockchainTransactionStatus(
        transactionHash,
        'failed'
      );
    }
  }

  async getOptimalNetwork(): Promise<{ networkId: number; name: string; estimatedGasFee: string }> {
    try {
      const estimates = [];
      
      for (const [networkId, provider] of this.providers) {
        try {
          const feeData = await provider.getFeeData();
          const network = Object.values(NETWORKS).find(n => n.id === networkId);
          
          if (feeData.maxFeePerGas && network) {
            const estimatedGasFee = (feeData.maxFeePerGas * BigInt(network.gasLimit)).toString();
            estimates.push({
              networkId,
              name: network.name,
              estimatedGasFee,
              gasPrice: feeData.maxFeePerGas,
            });
          }
        } catch (error) {
          console.error(`네트워크 ${networkId} 가스비 조회 실패:`, error);
        }
      }

      // Sort by gas fee (lowest first)
      estimates.sort((a, b) => Number(a.gasPrice) - Number(b.gasPrice));
      
      return estimates[0] || {
        networkId: 137, // Default to Polygon
        name: 'Polygon Mainnet',
        estimatedGasFee: '0',
      };
    } catch (error) {
      console.error('최적 네트워크 조회 오류:', error);
      return {
        networkId: 137,
        name: 'Polygon Mainnet',
        estimatedGasFee: '0',
      };
    }
  }

  async getTransactionStatus(transactionHash: string, networkId: number): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    confirmations?: number;
    gasUsed?: string;
    gasFee?: string;
  }> {
    try {
      const provider = this.getProvider(networkId);
      if (!provider) {
        return { status: 'failed' };
      }

      const receipt = await provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;
      
      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        confirmations,
        gasUsed: receipt.gasUsed.toString(),
        gasFee: (receipt.gasUsed * receipt.gasPrice).toString(),
      };
    } catch (error) {
      console.error('트랜잭션 상태 조회 오류:', error);
      return { status: 'failed' };
    }
  }
}

export const blockchainService = new BlockchainService();