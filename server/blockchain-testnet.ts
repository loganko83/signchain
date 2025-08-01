import crypto from "crypto";
import { ethers } from 'ethers';
import { generateDocumentHash } from './crypto';

export interface BlockchainTransaction {
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
  gasFee?: string;
  confirmations: number;
  isValid: boolean;
  network: string;
}

export interface TestnetConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  gasPrice: string;
}

export class BlockchainTestnetService {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private wallets: Map<string, ethers.Wallet> = new Map();
  private testnetConfigs: Map<string, TestnetConfig> = new Map();

  constructor() {
    this.initializeTestnets();
  }

  private initializeTestnets() {
    // 다양한 테스트넷 설정 (Xphere 네트워크 추가)
    const testnets: TestnetConfig[] = [
      {
        name: 'xphere-testnet',
        rpcUrl: 'https://xphere-rpc.com',
        chainId: 10001, // Xphere 테스트넷 체인 ID
        explorerUrl: 'https://explorer.xphere.io',
        gasPrice: '1.0'
      },
      {
        name: 'xphere-ankr',
        rpcUrl: 'https://ankr.com/rpc/xphere',
        chainId: 10001,
        explorerUrl: 'https://explorer.xphere.io',
        gasPrice: '1.0'
      },
      {
        name: 'polygon-mumbai',
        rpcUrl: 'https://polygon-mumbai.blockpi.network/v1/rpc/public',
        chainId: 80001,
        explorerUrl: 'https://mumbai.polygonscan.com',
        gasPrice: '1.5'
      },
      {
        name: 'ethereum-sepolia',
        rpcUrl: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
        chainId: 11155111,
        explorerUrl: 'https://sepolia.etherscan.io',
        gasPrice: '20'
      },
      {
        name: 'bsc-testnet',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        chainId: 97,
        explorerUrl: 'https://testnet.bscscan.com',
        gasPrice: '10'
      }
    ];

    testnets.forEach(config => {
      this.testnetConfigs.set(config.name, config);
      
      try {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.providers.set(config.name, provider);

        // 테스트용 프라이빗 키 (실제 운영에서는 환경변수 사용)
        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || 
          '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat test key
        
        const wallet = new ethers.Wallet(privateKey, provider);
        this.wallets.set(config.name, wallet);

        console.log(`✅ ${config.name} testnet initialized`);
      } catch (error) {
        console.warn(`⚠️ Failed to initialize ${config.name}:`, error.message);
      }
    });
  }

  // 테스트넷 상태 확인
  async checkTestnetStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};

    for (const [name, provider] of this.providers) {
      try {
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        const wallet = this.wallets.get(name);
        const balance = wallet ? await provider.getBalance(wallet.address) : '0';

        status[name] = {
          connected: true,
          chainId: Number(network.chainId),
          blockNumber,
          walletAddress: wallet?.address || 'N/A',
          balance: ethers.formatEther(balance),
          config: this.testnetConfigs.get(name)
        };
      } catch (error) {
        status[name] = {
          connected: false,
          error: error.message,
          config: this.testnetConfigs.get(name)
        };
      }
    }

    return status;
  }

  // 문서 해시를 블록체인에 등록 (실제 테스트넷)
  async registerDocumentOnTestnet(
    documentHash: string, 
    documentType: string, 
    network: string = 'polygon-mumbai'
  ): Promise<BlockchainTransaction> {
    const provider = this.providers.get(network);
    const wallet = this.wallets.get(network);
    
    if (!provider || !wallet) {
      throw new Error(`Network ${network} not available`);
    }

    try {
      // 간단한 트랜잭션으로 문서 해시를 블록체인에 기록
      // 실제로는 스마트 컨트랙트 함수를 호출하지만, 
      // 여기서는 트랜잭션의 input data에 해시를 포함
      const transaction = {
        to: wallet.address, // 자기 자신에게 보내는 트랜잭션
        value: ethers.parseEther('0'), // 0 ETH
        data: ethers.hexlify(ethers.toUtf8Bytes(`DOC:${documentHash}:${documentType}`)),
        gasLimit: 21000 + (documentHash.length * 68) // 기본 가스 + 데이터 가스
      };

      console.log(`📝 Registering document on ${network}:`, documentHash);
      
      const txResponse = await wallet.sendTransaction(transaction);
      console.log(`🔗 Transaction sent: ${txResponse.hash}`);
      
      // 트랜잭션 확인 대기 (최대 30초)
      const receipt = await txResponse.wait(1);
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      console.log(`✅ Document registered on block ${receipt.blockNumber}`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasFee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        confirmations: 1,
        isValid: receipt.status === 1,
        network
      };

    } catch (error) {
      console.error(`❌ Failed to register document on ${network}:`, error);
      
      // 실패 시 Mock 데이터 반환
      return {
        transactionHash: '0x' + require('crypto').randomBytes(32).toString('hex'),
        blockNumber: 0,
        gasUsed: '21000',
        gasFee: '0.001',
        confirmations: 0,
        isValid: false,
        network: network + '-mock'
      };
    }
  }

  // 서명을 블록체인에 등록
  async registerSignatureOnTestnet(
    documentHash: string,
    signerAddress: string,
    signatureHash: string,
    network: string = 'polygon-mumbai'
  ): Promise<BlockchainTransaction> {
    const provider = this.providers.get(network);
    const wallet = this.wallets.get(network);
    
    if (!provider || !wallet) {
      throw new Error(`Network ${network} not available`);
    }

    try {
      const transaction = {
        to: wallet.address,
        value: ethers.parseEther('0'),
        data: ethers.hexlify(ethers.toUtf8Bytes(`SIG:${documentHash}:${signerAddress}:${signatureHash}`)),
        gasLimit: 25000
      };

      console.log(`✍️ Registering signature on ${network}`);
      
      const txResponse = await wallet.sendTransaction(transaction);
      const receipt = await txResponse.wait(1);
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      console.log(`✅ Signature registered on block ${receipt.blockNumber}`);

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasFee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        confirmations: 1,
        isValid: receipt.status === 1,
        network
      };

    } catch (error) {
      console.error(`❌ Failed to register signature on ${network}:`, error);
      
      return {
        transactionHash: '0x' + require('crypto').randomBytes(32).toString('hex'),
        blockNumber: 0,
        gasUsed: '25000',
        gasFee: '0.002',
        confirmations: 0,
        isValid: false,
        network: network + '-mock'
      };
    }
  }

  // 트랜잭션 검증
  async verifyTransaction(txHash: string, network: string): Promise<BlockchainTransaction | null> {
    const provider = this.providers.get(network);
    
    if (!provider) {
      throw new Error(`Network ${network} not available`);
    }

    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      const currentBlock = await provider.getBlockNumber();
      
      if (!receipt) {
        return null;
      }

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasFee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        confirmations: currentBlock - receipt.blockNumber,
        isValid: receipt.status === 1,
        network
      };

    } catch (error) {
      console.error(`❌ Failed to verify transaction ${txHash} on ${network}:`, error);
      return null;
    }
  }

  // 네트워크별 가스비 조회
  async getGasPrices(): Promise<Record<string, string>> {
    const gasPrices: Record<string, string> = {};

    for (const [name, provider] of this.providers) {
      try {
        const gasPrice = await provider.getFeeData();
        gasPrices[name] = ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei') + ' Gwei';
      } catch (error) {
        gasPrices[name] = 'Error: ' + error.message;
      }
    }

    return gasPrices;
  }

  // 지원되는 네트워크 목록
  getSupportedNetworks(): string[] {
    return Array.from(this.testnetConfigs.keys());
  }

  // 네트워크 설정 정보
  getNetworkConfig(network: string): TestnetConfig | undefined {
    return this.testnetConfigs.get(network);
  }

  // 지갑 주소 조회
  getWalletAddress(network: string): string | undefined {
    return this.wallets.get(network)?.address;
  }
}

// 싱글톤 인스턴스
export const blockchainTestnetService = new BlockchainTestnetService();
