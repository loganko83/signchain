import { Router } from 'express';
import { blockchainTestnetService } from '../blockchain-testnet';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 테스트넷 상태 확인
router.get('/status', async (req, res) => {
  try {
    const status = await blockchainTestnetService.checkTestnetStatus();
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
    const networks = blockchainTestnetService.getSupportedNetworks();
    const configs = networks.map(network => ({
      name: network,
      config: blockchainTestnetService.getNetworkConfig(network),
      walletAddress: blockchainTestnetService.getWalletAddress(network)
    }));

    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 가스비 정보
router.get('/gas-prices', async (req, res) => {
  try {
    const gasPrices = await blockchainTestnetService.getGasPrices();
    res.json({
      success: true,
      data: gasPrices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 문서 블록체인 등록 (테스트넷)
router.post('/register-document', authenticateToken, async (req, res) => {
  try {
    const { documentHash, documentType, network = 'polygon-mumbai' } = req.body;

    if (!documentHash || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'documentHash and documentType are required'
      });
    }

    const result = await blockchainTestnetService.registerDocumentOnTestnet(
      documentHash,
      documentType,
      network
    );

    res.json({
      success: true,
      data: result,
      message: `Document registered on ${network} testnet`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 서명 블록체인 등록 (테스트넷)
router.post('/register-signature', authenticateToken, async (req, res) => {
  try {
    const { 
      documentHash, 
      signerAddress, 
      signatureHash, 
      network = 'polygon-mumbai' 
    } = req.body;

    if (!documentHash || !signerAddress || !signatureHash) {
      return res.status(400).json({
        success: false,
        error: 'documentHash, signerAddress, and signatureHash are required'
      });
    }

    const result = await blockchainTestnetService.registerSignatureOnTestnet(
      documentHash,
      signerAddress,
      signatureHash,
      network
    );

    res.json({
      success: true,
      data: result,
      message: `Signature registered on ${network} testnet`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 트랜잭션 검증
router.get('/verify/:network/:txHash', async (req, res) => {
  try {
    const { network, txHash } = req.params;

    const result = await blockchainTestnetService.verifyTransaction(txHash, network);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: result
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

    // 테스트용 문서 해시 생성
    const testDocHash = require('crypto')
      .createHash('sha256')
      .update(message + Date.now())
      .digest('hex');

    const result = await blockchainTestnetService.registerDocumentOnTestnet(
      testDocHash,
      'test-document',
      network
    );

    res.json({
      success: true,
      data: {
        ...result,
        testMessage: message,
        documentHash: testDocHash
      },
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
