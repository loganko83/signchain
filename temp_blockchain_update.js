const fs = require('fs');

// 파일 읽기
let content = fs.readFileSync('server/blockchain-testnet.ts', 'utf8');

// RPC URL 업데이트
content = content.replace(
  'https://rpc-mumbai.maticvigil.com',
  'https://polygon-mumbai.blockpi.network/v1/rpc/public'
);

content = content.replace(
  'https://sepolia.infura.io/v3/your-infura-key',
  'https://ethereum-sepolia.blockpi.network/v1/rpc/public'
);

// 파일 저장
fs.writeFileSync('server/blockchain-testnet.ts', content);
console.log('✅ RPC URLs updated successfully');
