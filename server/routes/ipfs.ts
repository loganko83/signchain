import express from 'express';
import multer from 'multer';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import NodeCache from 'node-cache';

const router = express.Router();

// Configure multer for file uploads with improved settings
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (increased)
  },
});

// Multi-tier caching system
const fileCache = new NodeCache({ 
  stdTTL: 600, // 10 minute TTL (increased)
  checkperiod: 120, // Check every 2 minutes
  maxKeys: 1000, // Maximum 1000 cached files
  useClones: false // Better performance for large files
});

// Metadata cache (smaller, longer TTL)
const metadataCache = new NodeCache({ 
  stdTTL: 3600, // 1 hour TTL
  checkperiod: 300,
  maxKeys: 5000
});

let heliaNode: any = null;
let unixfsInstance: any = null;

// IPFS Gateway URLs for fallback
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/'
];

// Initialize Helia IPFS node with simplified stable settings
async function initializeIPFS() {
  try {
    if (!heliaNode) {
      heliaNode = await createHelia({
        // Simplified libp2p settings for better stability
        libp2p: {
          connectionManager: {
            maxConnections: 100,
            minConnections: 10,
          },
          // Basic connection gating
          connectionGater: {
            denyDialMultiaddr: () => false
          }
        }
      });
      
      unixfsInstance = unixfs(heliaNode);
      console.log('🌍 IPFS Helia node initialized with enhanced performance settings');
      
      // Log connection statistics periodically
      setInterval(() => {
        const connections = heliaNode.libp2p.getConnections().length;
        const peers = heliaNode.libp2p.getPeers().length;
        console.log(`📊 IPFS Stats - Connections: ${connections}, Peers: ${peers}, Cache: ${fileCache.keys().length} files`);
      }, 60000); // Every minute
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
 * Helper function to create file chunks for better streaming
 */
async function* streamFileFromIPFS(ipfsFs: any, hash: string, chunkSize = 64 * 1024) {
  try {
    for await (const chunk of ipfsFs.cat(hash)) {
      // Process chunks in smaller sizes for better streaming
      let offset = 0;
      while (offset < chunk.length) {
        const end = Math.min(offset + chunkSize, chunk.length);
        yield chunk.slice(offset, end);
        offset = end;
      }
    }
  } catch (error) {
    console.error(`Error streaming file ${hash}:`, error);
    throw error;
  }
}

/**
 * Helper function to get file with timeout and retries
 */
async function getFileWithRetry(ipfsFs: any, hash: string, maxRetries = 3, timeoutMs = 30000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`IPFS operation timeout (attempt ${attempt})`)), timeoutMs);
      });

      const filePromise = (async () => {
        const chunks = [];
        for await (const chunk of streamFileFromIPFS(ipfsFs, hash)) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      })();

      return await Promise.race([filePromise, timeout]) as Buffer;
    } catch (error) {
      console.warn(`IPFS fetch attempt ${attempt} failed for ${hash}:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * POST /api/v1/ipfs/upload
 * Upload file to IPFS with enhanced metadata
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

    // Enhanced file metadata
    const checksum = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const fileMetadata = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      checksum,
      uploadedBy: req.body.uploadedBy || 'anonymous',
      category: req.body.category || 'general',
      description: req.body.description || '',
      version: '1.0',
      encoding: 'utf8'
    };

    // Add file to IPFS with progress tracking
    console.log(`📤 Starting upload for ${req.file.originalname} (${req.file.size} bytes)`);
    const startTime = Date.now();
    
    const cid = await ipfsFs.addBytes(req.file.buffer);
    
    const uploadTime = Date.now() - startTime;
    console.log(`✅ File uploaded to IPFS in ${uploadTime}ms: ${cid.toString()}`);

    // Add metadata to IPFS
    const metadataJson = JSON.stringify(fileMetadata, null, 2);
    const metadataCid = await ipfsFs.addBytes(
      new TextEncoder().encode(metadataJson)
    );

    // Cache both file and metadata
    const cacheData = {
      buffer: req.file.buffer,
      metadata: fileMetadata,
      uploadTime,
      cachedAt: Date.now()
    };
    
    fileCache.set(cid.toString(), cacheData);
    metadataCache.set(cid.toString(), fileMetadata);

    // Create enhanced response with multiple gateway URLs
    const response = {
      success: true,
      data: {
        ipfsHash: cid.toString(),
        metadataHash: metadataCid.toString(),
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        checksum,
        uploadedAt: fileMetadata.uploadedAt,
        uploadTime,
        gateways: IPFS_GATEWAYS.map(gateway => ({
          name: gateway.includes('cloudflare') ? 'Cloudflare' : 
                gateway.includes('pinata') ? 'Pinata' :
                gateway.includes('dweb') ? 'DWEB' : 'IPFS.io',
          url: `${gateway}${cid.toString()}`
        })),
        localGatewayUrl: `http://localhost:8080/ipfs/${cid.toString()}`,
        downloadUrl: `/api/v1/ipfs/download/${cid.toString()}`,
        performance: {
          uploadTime: `${uploadTime}ms`,
          avgSpeed: `${(req.file.size / uploadTime * 1000 / 1024).toFixed(2)} KB/s`
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file to IPFS',
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: {
        suggestions: [
          'Check if IPFS node is properly connected to the network',
          'Verify file size is within limits',
          'Ensure stable internet connection'
        ]
      }
    });
  }
});

/**
 * GET /api/v1/ipfs/download/:hash
 * Download file from IPFS with optimized streaming and fallback
 */
router.get('/download/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const startTime = Date.now();
    
    // Check cache first with performance tracking
    const cached = fileCache.get(hash);
    if (cached) {
      const cacheTime = Date.now() - startTime;
      console.log(`📦 Cache hit for file: ${hash} (${cacheTime}ms)`);
      
      // Set enhanced headers from cached metadata
      if (cached.metadata?.mimeType) {
        res.set('Content-Type', cached.metadata.mimeType);
      }
      
      if (cached.metadata?.originalName) {
        res.set('Content-Disposition', `attachment; filename="${cached.metadata.originalName}"`);
      }
      
      res.set('Content-Length', cached.buffer.length.toString());
      res.set('Cache-Control', 'public, max-age=600'); // 10 minute cache
      res.set('X-IPFS-Hash', hash);
      res.set('X-Cache-Status', 'HIT');
      res.set('X-Download-Time', `${cacheTime}ms`);
      
      return res.send(cached.buffer);
    }

    const { helia, fs: ipfsFs } = await initializeIPFS();

    // Get file with retry mechanism
    console.log(`📥 Fetching file from IPFS: ${hash}`);
    const fileBuffer = await getFileWithRetry(ipfsFs, hash, 3, 45000); // 45 second timeout with 3 retries
    
    const downloadTime = Date.now() - startTime;
    console.log(`✅ File downloaded from IPFS: ${hash} (${fileBuffer.length} bytes, ${downloadTime}ms)`);

    // Try to get metadata
    let metadata = metadataCache.get(hash);
    if (!metadata) {
      try {
        const metadataBuffer = await getFileWithRetry(ipfsFs, `${hash}_metadata`, 1, 10000);
        metadata = JSON.parse(metadataBuffer.toString());
        metadataCache.set(hash, metadata);
      } catch {
        // Metadata not available, continue without it
        console.log(`ℹ️ No metadata found for ${hash}`);
      }
    }

    // Cache the file for future requests
    fileCache.set(hash, {
      buffer: fileBuffer,
      metadata: metadata || {},
      downloadTime,
      cachedAt: Date.now()
    });

    // Set appropriate headers with performance info
    if (metadata?.mimeType) {
      res.set('Content-Type', metadata.mimeType);
    } else {
      res.set('Content-Type', 'application/octet-stream');
    }
    
    if (metadata?.originalName) {
      res.set('Content-Disposition', `attachment; filename="${metadata.originalName}"`);
    }

    res.set('Content-Length', fileBuffer.length.toString());
    res.set('Cache-Control', 'public, max-age=600'); // 10 minute cache
    res.set('X-IPFS-Hash', hash);
    res.set('X-Cache-Status', 'MISS');
    res.set('X-Download-Time', `${downloadTime}ms`);
    res.set('X-Download-Speed', `${(fileBuffer.length / downloadTime * 1000 / 1024).toFixed(2)} KB/s`);
    
    res.send(fileBuffer);

  } catch (error) {
    const downloadTime = Date.now() - (req as any).startTime || 0;
    console.error('IPFS download error:', error);
    
    if (error.message.includes('timeout')) {
      res.status(408).json({
        success: false,
        message: 'Request timeout - IPFS operation took too long',
        error: 'timeout',
        troubleshooting: {
          suggestions: [
            'File may not be available on the network',
            'Try again in a few moments',
            'Check if the IPFS hash is correct',
            'Consider using a public IPFS gateway as fallback'
          ],
          gateways: IPFS_GATEWAYS.map(gateway => `${gateway}${req.params.hash}`)
        },
        performance: {
          timeoutAfter: `${downloadTime}ms`
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found on IPFS',
        error: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: {
          suggestions: [
            'Verify the IPFS hash is correct',
            'File may not be pinned or available',
            'Try using a public IPFS gateway'
          ],
          gateways: IPFS_GATEWAYS.map(gateway => `${gateway}${req.params.hash}`)
        }
      });
    }
  }
});

/**
 * GET /api/v1/ipfs/stream/:hash
 * Stream file from IPFS for large files
 */
router.get('/stream/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const startTime = Date.now();
    
    // Check if file is cached
    const cached = fileCache.get(hash);
    if (cached) {
      console.log(`📦 Streaming cached file: ${hash}`);
      
      if (cached.metadata?.mimeType) {
        res.set('Content-Type', cached.metadata.mimeType);
      }
      
      res.set('X-Cache-Status', 'HIT');
      res.set('X-IPFS-Hash', hash);
      
      return res.send(cached.buffer);
    }

    const { helia, fs: ipfsFs } = await initializeIPFS();

    // Set up streaming headers
    res.set('Content-Type', 'application/octet-stream');
    res.set('X-Cache-Status', 'STREAMING');
    res.set('X-IPFS-Hash', hash);

    console.log(`📡 Streaming file from IPFS: ${hash}`);
    
    let totalBytes = 0;
    const chunks = [];
    
    // Stream the file
    for await (const chunk of streamFileFromIPFS(ipfsFs, hash, 32 * 1024)) {
      totalBytes += chunk.length;
      chunks.push(chunk);
      res.write(chunk);
    }
    
    res.end();
    
    const streamTime = Date.now() - startTime;
    console.log(`✅ File streamed: ${hash} (${totalBytes} bytes, ${streamTime}ms)`);
    
    // Cache the complete file for future requests
    const completeBuffer = Buffer.concat(chunks);
    fileCache.set(hash, {
      buffer: completeBuffer,
      metadata: {},
      downloadTime: streamTime,
      cachedAt: Date.now()
    });

  } catch (error) {
    console.error('IPFS streaming error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to stream file from IPFS',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

/**
 * GET /api/v1/ipfs/status/:hash
 * Enhanced file status check with performance metrics
 */
router.get('/status/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const startTime = Date.now();
    
    // Quick cache check
    const cached = fileCache.get(hash);
    const metadata = metadataCache.get(hash);
    
    if (cached) {
      const checkTime = Date.now() - startTime;
      return res.json({
        success: true,
        data: {
          hash,
          exists: true,
          cached: true,
          size: cached.buffer.length,
          metadata: cached.metadata || metadata,
          performance: {
            checkTime: `${checkTime}ms`,
            cacheAge: `${Math.round((Date.now() - cached.cachedAt) / 1000)}s`
          }
        }
      });
    }

    const { helia, fs: ipfsFs } = await initializeIPFS();

    // Quick existence check with enhanced timeout
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 15000); // 15 second timeout
    });

    const statsPromise = (async () => {
      try {
        // Try to get just the first chunk to check existence
        const iterator = ipfsFs.cat(hash);
        const { value, done } = await iterator.next();
        return { 
          exists: !done && value !== undefined,
          firstChunkSize: value ? value.length : 0
        };
      } catch {
        return { exists: false, firstChunkSize: 0 };
      }
    })();

    const result = await Promise.race([statsPromise, timeout]);
    const checkTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        hash,
        exists: result.exists,
        cached: false,
        metadata: metadata || null,
        performance: {
          checkTime: `${checkTime}ms`,
          networkCheck: true
        },
        ...(result.firstChunkSize && { firstChunkSize: result.firstChunkSize })
      }
    });

  } catch (error) {
    const checkTime = Date.now() - (req as any).startTime || 0;
    res.json({
      success: false,
      data: {
        hash: req.params.hash,
        exists: false,
        cached: false,
        performance: {
          checkTime: `${checkTime}ms`,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    });
  }
});

/**
 * GET /api/v1/ipfs/node/info
 * Enhanced IPFS node information with performance metrics
 */
router.get('/node/info', async (req, res) => {
  try {
    const { helia } = await initializeIPFS();

    const peerId = helia.libp2p.peerId.toString();
    const addresses = helia.libp2p.getMultiaddrs().map(ma => ma.toString());
    const connections = helia.libp2p.getConnections();
    const peers = helia.libp2p.getPeers();
    
    // Calculate cache statistics
    const cacheStats = {
      fileCache: {
        size: fileCache.keys().length,
        maxKeys: 1000,
        ttl: 600
      },
      metadataCache: {
        size: metadataCache.keys().length,
        maxKeys: 5000,
        ttl: 3600
      }
    };

    res.json({
      success: true,
      data: {
        peerId,
        addresses,
        connections: {
          count: connections.length,
          details: connections.map(conn => ({
            peer: conn.remotePeer.toString(),
            status: conn.status || 'unknown',
            direction: conn.stat?.direction || 'unknown'
          }))
        },
        peers: {
          count: peers.length,
          list: peers.map(peer => peer.toString()).slice(0, 10) // First 10 peers
        },
        cache: cacheStats,
        status: 'online',
        version: 'helia-optimized',
        performance: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        }
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
 * GET /api/v1/ipfs/cache/stats
 * Get detailed cache statistics
 */
router.get('/cache/stats', (req, res) => {
  const fileKeys = fileCache.keys();
  const metadataKeys = metadataCache.keys();
  
  let totalFileSize = 0;
  fileKeys.forEach(key => {
    const cached = fileCache.get(key);
    if (cached?.buffer) {
      totalFileSize += cached.buffer.length;
    }
  });

  res.json({
    success: true,
    data: {
      fileCache: {
        entries: fileKeys.length,
        totalSize: totalFileSize,
        totalSizeMB: (totalFileSize / 1024 / 1024).toFixed(2),
        ttl: 600,
        maxKeys: 1000
      },
      metadataCache: {
        entries: metadataKeys.length,
        ttl: 3600,
        maxKeys: 5000
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        cacheEfficiency: fileKeys.length > 0 ? ((fileKeys.length / 1000) * 100).toFixed(1) + '%' : '0%'
      }
    }
  });
});

/**
 * DELETE /api/v1/ipfs/cache/:hash
 * Clear specific file from cache with confirmation
 */
router.delete('/cache/:hash', (req, res) => {
  const { hash } = req.params;
  const fileDeleted = fileCache.del(hash);
  const metadataDeleted = metadataCache.del(hash);
  
  res.json({
    success: true,
    data: {
      hash,
      fileDeleted,
      metadataDeleted,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * DELETE /api/v1/ipfs/cache
 * Clear all cached files with statistics
 */
router.delete('/cache', (req, res) => {
  const fileKeys = fileCache.keys();
  const metadataKeys = metadataCache.keys();
  
  fileCache.flushAll();
  metadataCache.flushAll();
  
  res.json({
    success: true,
    data: {
      clearedFiles: fileKeys.length,
      clearedMetadata: metadataKeys.length,
      timestamp: new Date().toISOString(),
      message: 'All caches cleared successfully'
    }
  });
});

// Enhanced graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔌 Shutting down IPFS service gracefully...');
  
  // Clear caches
  fileCache.flushAll();
  metadataCache.flushAll();
  
  // Stop IPFS node
  if (heliaNode) {
    try {
      await heliaNode.stop();
      console.log('✅ IPFS node stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping IPFS node:', error);
    }
  }
  
  process.exit(0);
});

export default router;
