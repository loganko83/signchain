/**
 * Enhanced IPFS Service with Performance Optimizations
 * Real IPFS implementation with advanced caching, compression, and parallel downloads
 */

import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { bootstrap } from '@libp2p/bootstrap';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

interface IPFSFile {
  content: Uint8Array;
  path?: string;
}

interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  ipfsHash: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'contract' | 'approval' | 'identity' | 'general';
  compressed?: boolean;
}

interface DownloadOptions {
  useCache?: boolean;
  useCDN?: boolean;
  useCompression?: boolean;
  timeout?: number;
  maxRetries?: number;
  chunkSize?: number;
}

interface GatewayStats {
  url: string;
  responseTime: number;
  successRate: number;
  lastChecked: Date;
}

class HeliaIPFSService {
  private helia: any;
  private fs: any;
  private initialized = false;
  private cacheDir: string;
  private uploadsDir: string;
  private compressionDir: string;

  // 스마트 게이트웨이 관리
  private gateways: GatewayStats[] = [
    { url: 'https://ipfs.io/ipfs/', responseTime: 0, successRate: 1, lastChecked: new Date() },
    { url: 'https://gateway.pinata.cloud/ipfs/', responseTime: 0, successRate: 1, lastChecked: new Date() },
    { url: 'https://dweb.link/ipfs/', responseTime: 0, successRate: 1, lastChecked: new Date() },
    { url: 'https://cloudflare-ipfs.com/ipfs/', responseTime: 0, successRate: 1, lastChecked: new Date() },
    { url: 'https://cf-ipfs.com/ipfs/', responseTime: 0, successRate: 1, lastChecked: new Date() },
    { url: 'https://ipfs.fleek.co/ipfs/', responseTime: 0, successRate: 1, lastChecked: new Date() },
    { url: 'https://gateway.temporal.cloud/ipfs/', responseTime: 0, successRate: 1, lastChecked: new Date() }
  ];

  // 성능 통계
  private stats = {
    uploads: 0,
    downloads: 0,
    cacheHits: 0,
    compressionSaved: 0,
    totalBytes: 0
  };

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'cache', 'ipfs');
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.compressionDir = path.join(process.cwd(), 'cache', 'compressed');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 모든 디렉토리 생성
      await Promise.all([
        fs.mkdir(this.cacheDir, { recursive: true }),
        fs.mkdir(this.uploadsDir, { recursive: true }),
        fs.mkdir(this.compressionDir, { recursive: true })
      ]);

      // Helia IPFS 노드 생성 (개선된 설정)
      this.helia = await createHelia({
        blockstore: new MemoryBlockstore(),
        datastore: new MemoryDatastore(),
        libp2p: await createLibp2p({
          addresses: {
            listen: ['/ip4/127.0.0.1/tcp/0']
          },
          transports: [tcp()],
          streamMuxers: [mplex()],
          connectionEncryption: [noise()],
          peerDiscovery: [
            bootstrap({
              list: [
                '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJ