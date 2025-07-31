import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 간단한 테스트넷 상태 확인
router.get('/status', async (req, res) => {
  try {
    // 임시로 단순한 응답 반환
    const status = {
      'polygon-mumbai': {
        connected: true,
        chainId: 80001,
        blockNumber: 45000000,
        walletAddress: '0x742d35Cc6634C0532925a3b8D2f5e15bf03a8b8c',
        balance: '0.1',
        config: {
          name: 'polygon-mumbai',
          rpcUrl: 'https://polygon-mumbai.blockpi.network/v1/rpc/public',
          chainId: 80001,
          explorerUrl: 'https://mumbai.polygonscan.com',
          gasPrice: '1.5'
        }
      },
      'ethereum-sepolia': {
        connected: true,
        chainId: 11155111,
        blockNumber: 5800000,
        walletAddress: '0x742d35Cc6634C0532925a3b8D2f5e15bf03a8b8c',
        balance: '0.05',
        config: {
          name: 'ethereum-sepolia',
          rpcUrl: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
          chainId: 11155111,
          explorerUrl: 'https://sepolia.etherscan.io',
          gasPrice: '20'
        }
      }
    };

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 지원되는 네트워크 목록
router.get('/networks', (req, res) => {
  try {
    const networks = [
      {
        name: 'polygon-mumbai',
        config: {
          name: 'polygon-mumbai',
          rpcUrl: 'https://polygon-mumbai.blockpi.network/v1/rpc/public',
          chainId: 80001,
          explorerUrl: 'https://mumbai.polygonscan.com',
          gasPrice: '1.5'
        },
        walletAddress: '0x742d35Cc6634C0532925a3b8D2f5e15bf03a8b8c'
      },
      {
        name: 'ethereum-sepolia',
        config: {
          name: 'ethereum-sepolia',
          rpcUrl: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
          chainId: 11155111,
          explorerUrl: 'https://sepolia.etherscan.io',
          gasPrice: '20'
        },
        walletAddress: '0x742d35Cc6634C0532925a3b8D2f5e15bf03a8b8c'
      }
    ];

    res.json({
      success: true,
      data: networks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 테스트 트랜잭션 실행
router.post('/test-transaction', authenticateToken, async (req, res) => {
  try {
    const { network = 'polygon-mumbai', message = 'SignChain Test' } = req.body;

    // Mock 트랜잭션 결과
    const result = {
      transactionHash: '0x' + require('crypto').randomBytes(32).toString('hex'),
      blockNumber: Math.floor(Math.random() * 1000) + 45000000,
      gasUsed: '21000',
      gasFee: '0.001',
      confirmations: 1,
      isValid: true,
      network,
      testMessage: message,
      documentHash: require('crypto').createHash('sha256').update(message + Date.now()).digest('hex')
    };

    res.json({
      success: true,
      data: result,
      message: `Test transaction completed on ${network}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
