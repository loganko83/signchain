/**
 * Simplified IPFS Service for file storage
 * Mock implementation until Helia is properly configured
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

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
}

class MockIPFSService {
  private uploadsDir: string;
  private initialized = false;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create uploads directory if it doesn't exist
      await fs.mkdir(this.uploadsDir, { recursive: true });
      this.initialized = true;
      console.log('📁 Mock IPFS Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Mock IPFS Service:', error);
      throw error;
    }
  }

  /**
   * Generate a mock IPFS hash
   */
  private generateIPFSHash(content: Uint8Array): string {
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return `Qm${hash.substring(0, 44)}`;  // Mock IPFS hash format
  }

  /**
   * Upload file to local storage (mock IPFS)
   */
  async uploadFile(file: IPFSFile): Promise<string> {
    await this.initialize();

    try {
      const ipfsHash = this.generateIPFSHash(file.content);
      const filePath = path.join(this.uploadsDir, ipfsHash);
      
      // Save file to local uploads directory
      await fs.writeFile(filePath, file.content);
      
      console.log('📁 File uploaded to Mock IPFS:', ipfsHash);
      return ipfsHash;
    } catch (error) {
      console.error('❌ Failed to upload file to Mock IPFS:', error);
      throw error;
    }
  }

  /**
   * Download file from local storage (mock IPFS)
   */
  async downloadFile(hash: string): Promise<Uint8Array> {
    await this.initialize();

    try {
      const filePath = path.join(this.uploadsDir, hash);
      const fileBuffer = await fs.readFile(filePath);
      
      console.log('📥 File downloaded from Mock IPFS:', hash);
      return new Uint8Array(fileBuffer);
    } catch (error) {
      console.error('❌ Failed to download file from Mock IPFS:', error);
      throw error;
    }
  }

  /**
   * Pin file (no-op in mock implementation)
   */
  async pinFile(hash: string): Promise<void> {
    console.log('📌 File pinned (mock):', hash);
  }

  /**
   * Unpin file (no-op in mock implementation)
   */
  async unpinFile(hash: string): Promise<void> {
    console.log('📌 File unpinned (mock):', hash);
  }

  /**
   * Get file statistics
   */
  async getFileStats(hash: string): Promise<any> {
    await this.initialize();

    try {
      const filePath = path.join(this.uploadsDir, hash);
      const stats = await fs.stat(filePath);
      
      return {
        hash,
        size: stats.size,
        type: 'file',
        blocks: 1
      };
    } catch (error) {
      console.error('❌ Failed to get file stats from Mock IPFS:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(hash: string): Promise<boolean> {
    await this.initialize();

    try {
      const filePath = path.join(this.uploadsDir, hash);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Shutdown service (no-op in mock implementation)
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Mock IPFS Service stopped');
  }
}

// Singleton instance
export const ipfsService = new MockIPFSService();
export type { FileMetadata, IPFSFile };
