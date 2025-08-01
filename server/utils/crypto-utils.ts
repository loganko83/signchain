import crypto from 'crypto';

export function generateRandomHex(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateDocumentHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateTransactionHash(): string {
  return '0x' + generateRandomHex(32);
}

export function generateIPFSHash(): string {
  return 'Qm' + crypto.randomBytes(22).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
}
