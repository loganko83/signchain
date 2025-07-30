import express from 'express';
import multer from 'multer';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

let heliaNode: any = null;
let unixfsInstance: any = null;

// Initialize Helia IPFS node
async function initializeIPFS() {
  try {
    if (!heliaNode) {
      heliaNode = await createHelia();
      unixfsInstance = unixfs(heliaNode);
      console.log('🌍 IPFS Helia node initialized');
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
 * GET /api/v1/ipfs/node/info
 * Get IPFS node information
 */
router.get('/node/info', async (req, res) => {
  try {
    const { helia } = await initializeIPFS();

    const peerId = helia.libp2p.peerId.toString();
    const addresses = helia.libp2p.getMultiaddrs().map(ma => ma.toString());

    res.json({
      success: true,
      data: {
        peerId,
        addresses,
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
 * GET /api/v1/ipfs/:hash
 * Retrieve file from IPFS by hash
 */
router.get('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const { helia, fs: ipfsFs } = await initializeIPFS();

    // Get file from IPFS
    const chunks = [];
    for await (const chunk of ipfsFs.cat(hash)) {
      chunks.push(chunk);
    }
    
    const fileBuffer = Buffer.concat(chunks);

    // Try to get metadata if available
    let metadata = null;
    try {
      const metadataChunks = [];
      for await (const chunk of ipfsFs.cat(`${hash}_metadata`)) {
        metadataChunks.push(chunk);
      }
      const metadataBuffer = Buffer.concat(metadataChunks);
      metadata = JSON.parse(metadataBuffer.toString());
    } catch {
      // Metadata not available, continue without it
    }

    // Set appropriate headers
    if (metadata?.mimeType) {
      res.set('Content-Type', metadata.mimeType);
    }
    
    if (metadata?.originalName) {
      res.set('Content-Disposition', `inline; filename="${metadata.originalName}"`);
    }

    res.send(fileBuffer);

  } catch (error) {
    console.error('IPFS retrieval error:', error);
    res.status(404).json({
      success: false,
      message: 'File not found on IPFS',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/ipfs/:hash/info
 * Get file information from IPFS
 */
router.get('/:hash/info', async (req, res) => {
  try {
    const { hash } = req.params;
    const { helia, fs: ipfsFs } = await initializeIPFS();

    // Get file stats
    const stats = await ipfsFs.stat(hash);
    
    // Try to get metadata
    let metadata = null;
    try {
      const metadataChunks = [];
      for await (const chunk of ipfsFs.cat(`${hash}_metadata`)) {
        metadataChunks.push(chunk);
      }
      const metadataBuffer = Buffer.concat(metadataChunks);
      metadata = JSON.parse(metadataBuffer.toString());
    } catch {
      // Metadata not available
    }

    res.json({
      success: true,
      data: {
        hash,
        size: stats.size,
        type: stats.type,
        metadata: metadata || null,
        ipfsGatewayUrl: `https://ipfs.io/ipfs/${hash}`,
        localGatewayUrl: `http://localhost:8080/ipfs/${hash}`
      }
    });

  } catch (error) {
    console.error('IPFS info error:', error);
    res.status(404).json({
      success: false,
      message: 'File not found on IPFS',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/ipfs/pin/:hash
 * Pin file to local IPFS node
 */
router.post('/pin/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const { helia } = await initializeIPFS();

    // Pin the content
    await helia.pins.add(hash);

    res.json({
      success: true,
      message: `File ${hash} has been pinned to local IPFS node`
    });

  } catch (error) {
    console.error('IPFS pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pin file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/v1/ipfs/pin/:hash
 * Unpin file from local IPFS node
 */
router.delete('/pin/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const { helia } = await initializeIPFS();

    // Unpin the content
    await helia.pins.rm(hash);

    res.json({
      success: true,
      message: `File ${hash} has been unpinned from local IPFS node`
    });

  } catch (error) {
    console.error('IPFS unpin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unpin file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
