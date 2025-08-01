// Xphere 네트워크 연결 테스트 스크립트
import { ethers } from 'ethers';

async function testXphereConnection() {
  console.log('🔍 Xphere 네트워크 연결 테스트 시작...\n');
  
  const rpcUrls = [
    'https://xphere-rpc.com',
    'https://ankr.com/rpc/xphere'
  ];
  
  for (const rpcUrl of rpcUrls) {
    console.log(`📡 테스트 RPC: ${rpcUrl}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // 기본 네트워크 정보 수집
      const network = await provider.getNetwork();
      console.log(`   ✅ Chain ID: ${network.chainId}`);
      console.log(`   ✅ Network Name: ${network.name}`);
      
      // 최신 블록 정보
      const blockNumber = await provider.getBlockNumber();
      console.log(`   ✅ 최신 블록: ${blockNumber}`);
      
      // 가스 가격 정보
      const gasPrice = await provider.getFeeData();
      console.log(`   ✅ 가스 가격: ${ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')} Gwei`);
      
      // 최신 블록 상세 정보
      const block = await provider.getBlock('latest');
      if (block) {
        console.log(`   ✅ 블록 해시: ${block.hash}`);
        console.log(`   ✅ 타임스탬프: ${new Date(block.timestamp * 1000).toISOString()}`);
      }
      
      console.log(`   ✅ ${rpcUrl} 연결 성공!\n`);
      
    } catch (error) {
      console.log(`   ❌ ${rpcUrl} 연결 실패:`);
      console.log(`   📝 에러: ${error.message}\n`);
    }
  }
}

// 지갑 생성 테스트
function generateWallet() {
  console.log('🔐 개발용 지갑 생성...\n');
  
  const wallet = ethers.Wallet.createRandom();
  
  console.log('📋 지갑 정보:');
  console.log(`   주소: ${wallet.address}`);
  console.log(`   프라이빗 키: ${wallet.privateKey}`);
  console.log(`   니모닉: ${wallet.mnemonic?.phrase || 'N/A'}\n`);
  
  console.log('⚠️  보안 주의사항:');
  console.log('   - 프라이빗 키는 안전한 곳에 보관하세요');
  console.log('   - 실제 자금을 보내기 전에 충분히 테스트하세요');
  console.log('   - 개발용으로만 사용하세요\n');
  
  return wallet;
}

// 메인 실행
async function main() {
  console.log('🚀 Xphere 블록체인 통합 테스트\n');
  console.log('=' + '='.repeat(50) + '\n');
  
  // 1. 네트워크 연결 테스트
  await testXphereConnection();
  
  // 2. 지갑 생성 테스트
  const testWallet = generateWallet();
  
  console.log('📝 다음 단계:');
  console.log('   1. Xphere 토큰 확보');
  console.log('   2. 스마트 컨트랙트 개발');
  console.log('   3. 컨트랙트 배포 테스트');
  console.log('\n테스트 완료! 🎉');
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testXphereConnection, generateWallet };
