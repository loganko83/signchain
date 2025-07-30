import express from 'express';
import multer from 'multer';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import NodeCache from 'node-cache';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Cache for IPFS files (5 minute TTL)
const fileCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

let heliaNode: any = null;
let unixfsInstance: any = null;

// Initialize Helia IPFS node with optimized settings
async function initializeIPFS() {
  try {
    if (!heliaNode) {
      heliaNode = await createHelia({
        // Optimized libp2p settings for better performance
        libp2p: {
          connectionManager: {
            maxConnections: 100,
            minConnections: 10,
          },
          // Enable connection gating for better performance
          connectionGater: {
            denyDialMultiaddr: () => false
          }
        }
      });
      unixfsInstance = unixfs(heliaNode);
      console.log('🌍 IPFS Helia node initialized with optimized settings');
    }
    return { helia: heliaNode, fs: unixfsInstance };
  } catch (error) {
    console.error('IPFS initialization error:', error);
    throw error;
  }
}

// Initialize IPFS on module load
initializeIPFS().catch(console.error);

/**
 * POST /api/v1/ipfs/upload
 * Upload file to IPFS
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { helia, fs: ipfsFs } = await initializeIPFS();

    // Create file metadata
    const fileMetadata = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      checksum: crypto.createHash('sha256').update(req.file.buffer).digest('hex')
    };

    // Add file to IPFS
    const cid = await ipfsFs.addBytes(req.file.buffer);

    // Add metadata to IPFS
    const metadataCid = await ipfsFs.addBytes(
      new TextEncoder().encode(JSON.stringify(fileMetadata, null, 2))
    );

    // Cache the file for quick access
    fileCache.set(cid.toString(), {
      buffer: req.file.buffer,
      metadata: fileMetadata
    });

    // Create response
    const response = {
      success: true,
      data: {
        ipfsHash: cid.toString(),
        metadataHash: metadataCid.toString(),
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        checksum: fileMetadata.checksum,
        uploadedAt: fileMetadata.uploadedAt,
        ipfsGatewayUrl: `https://ipfs.io/ipfs/${cid.toString()}`,
        localGatewayUrl: `http://localhost:8080/ipfs/${cid.toString()}`
      }
    };

    console.log(`📁 File uploaded to IPFS: ${cid.toString()}`);
    res.json(response);

  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file to IPFS',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/ipfs/download/:hash
 * Download file from IPFS with optimized streaming
 */
router.get('/download/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    // Check cache first
    const cached = fileCache.get(hash);
    if (cached) {
      console.log(`📦 Cache hit for file: ${hash}`);
      
      // Set headers from cached metadata
      if (cached.metadata?.mimeType) {
        res.set('Content-Type', cached.metadata.mimeType);
      }
      
      if (cached.metadata?.originalName) {
        res.set('Content-Disposition', `attachment; filename="${cached.metadata.originalName}"`);
      }
      
      res.set('Content-Length', cached.buffer.length.toString());
      res.set('Cache-Control', 'public, max-age=300'); // 5 minute cache
      
      return res.send(cached.buffer);
    }

    const { helia, fs: ipfsFs } = await initializeIPFS();

    // Set timeout for IPFS operations
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('IPFS operation timeout')), 30000); // 30 second timeout
    });

    // Get file from IPFS with timeout
    const filePromise = (async () => {
      const chunks = [];
      for await (const chunk of ipfsFs.cat(hash)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    })();

    const fileBuffer = await Promise.race([filePromise, timeout]) as Buffer;

    // Try to get metadata if available
    let metadata = null;
    try {
      const metadataPromise = (async () => {
        const metadataChunks = [];
        for await (const chunk of ipfsFs.cat(`${hash}_metadata`)) {
          metadataChunks.push(chunk);
        }
        return Buffer.concat(metadataChunks);
      })();
      
      const metadataBuffer = await Promise.race([metadataPromise, timeout]) as Buffer;
      metadata = JSON.parse(metadataBuffer.toString());
    } catch {
      // Metadata not available, continue without it
    }

    // Cache the file for future requests
    fileCache.set(hash, {
      buffer: fileBuffer,
      metadata: metadata
    });

    // Set appropriate headers
    if (metadata?.mimeType) {
      res.set('Content-Type', metadata.mimeType);
    } else {
      res.set('Content-Type', 'application/octet-stream');
    }
    
    if (metadata?.originalName) {
      res.set('Content-Disposition', `attachment; filename="${metadata.originalName}"`);
    }

    res.set('Content-Length', fileBuffer.length.toString());
    res.set('Cache-Control', 'public, max-age=300'); // 5 minute cache
    
    console.log(`📥 File downloaded from IPFS: ${hash} (${fileBuffer.length} bytes)`);
    res.send(fileBuffer);

  } catch (error) {
    console.error('IPFS download error:', error);
    
    if (error.message === 'IPFS operation timeout') {
      res.status(408).json({
        success: false,
        message: 'Request timeout - IPFS operation took too long',
        error: 'timeout'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found on IPFS',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

/**
 * GET /api/v1/ipfs/status/:hash
 * Check if file exists on IPFS
 */
router.get('/status/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    // Quick cache check
    const cached = fileCache.get(hash);
    if (cached) {
      return res.json({
        success: true,
        data: {
          hash,
          exists: true,
          cached: true,
          size: cached.buffer.length,
          metadata: cached.metadata
        }
      });
    }

    const { helia, fs: ipfsFs } = await initializeIPFS();

    // Quick existence check with timeout
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 10000); // 10 second timeout
    });

    const statsPromise = (async () => {
      // Try to get just the first chunk to check existence
      const iterator = ipfsFs.cat(hash);
      const { value } = await iterator.next();
      return value ? { exists: true } : { exists: false };
    })();

    const result = await Promise.race([statsPromise, timeout]);

    res.json({
      success: true,
      data: {
        hash,
        exists: result.exists,
        cached: false
      }
    });

  } catch (error) {
    res.json({
      success: false,
      data: {
        hash: req.params.hash,
        exists: false,
        cached: false
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/ipfs/node/info
 * Get IPFS node information
 */
router.get('/node/info', async (req, res) => {
  try {
    const { helia } = await initializeIPFS();

    const peerId = helia.libp2p.peerId.toString();
    const addresses = helia.libp2p.getMultiaddrs().map(ma => ma.toString());
    const connections = helia.libp2p.getConnections().length;

    res.json({
      success: true,
      data: {
        peerId,
        addresses,
        connections,
        cacheSize: fileCache.keys().length,
        status: 'online',
        version: 'helia-latest'
      }
    });

  } catch (error) {
    console.error('IPFS node info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get node info',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/v1/ipfs/cache/:hash
 * Clear specific file from cache
 */
router.delete('/cache/:hash', (req, res) => {
  const { hash } = req.params;
  const deleted = fileCache.del(hash);
  
  res.json({
    success: true,
    data: {
      hash,
      deleted
    }
  });
});

/**
 * DELETE /api/v1/ipfs/cache
 * Clear all cached files
 */
router.delete('/cache', (req, res) => {
  const keys = fileCache.keys();
  fileCache.flushAll();
  
  res.json({
    success: true,
    data: {
      clearedCount: keys.length
    }
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (heliaNode) {
    console.log('🔌 Shutting down IPFS node...');
    await heliaNode.stop();
  }
  process.exit(0);
});

export default router;