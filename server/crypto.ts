import crypto from 'crypto';

// 문서 해시 생성
export function generateDocumentHash(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// 서명 해시 생성
export function generateSignatureHash(signatureData: string): string {
  return crypto.createHash('sha256').update(signatureData).digest('hex');
}

// 랜덤 토큰 생성
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// HMAC 서명 생성
export function generateHMACSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// HMAC 서명 검증
export function verifyHMACSignature(data: string, signature: string, secret: string): boolean {
  const expectedSignature = generateHMACSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// 키 쌍 생성
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  
  return { publicKey, privateKey };
}

// 데이터 암호화
export function encryptData(data: string, key: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// 데이터 복호화
export function decryptData(encryptedData: string, key: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}