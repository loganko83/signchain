import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db, files, insertFileSchema } from '../../db/index.js';
import { ipfsService } from '../services/ipfsService.js';
import { authenticateToken } from '../middleware/auth.js';
import { eq, and, or, like, desc } from 'drizzle-orm';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/json'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Upload file schema
const uploadFileSchema = z.object({
  category: z.enum(['contract', 'approval', 'identity', 'general']).default('general'),
  isPublic: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

/**
 * POST /api/v1/files/upload
 * Upload file to IPFS and save metadata to database
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate request body
    const { category, isPublic, metadata } = uploadFileSchema.parse(req.body);

    // Upload to IPFS
    const ipfsHash = await ipfsService.uploadFile({
      content: req.file.buffer,
      path: req.file.originalname
    });

    // Pin the file to ensure availability
    await ipfsService.pinFile(ipfsHash);

    // Save metadata to database
    const fileRecord = await db.insert(files).values({
      filename: `${Date.now()}_${req.file.originalname}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      ipfsHash,
      uploadedBy: userId,
      category,
      isPublic,
      metadata
    }).returning();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        file: fileRecord[0],
        ipfsHash,
        ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/files/:id
 * Get file metadata by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const fileRecord = await db.query.files.findFirst({
      where: (files, { eq }) => eq(files.id, id)
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check access permission
    if (!fileRecord.isPublic && fileRecord.uploadedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: fileRecord
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/files/:id/download
 * Download file from IPFS
 */
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const fileRecord = await db.query.files.findFirst({
      where: (files, { eq }) => eq(files.id, id)
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check access permission
    if (!fileRecord.isPublic && fileRecord.uploadedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Download from IPFS
    const fileData = await ipfsService.downloadFile(fileRecord.ipfsHash);

    // Set appropriate headers
    res.setHeader('Content-Type', fileRecord.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    res.setHeader('Content-Length', fileRecord.size.toString());

    // Send file data
    res.end(Buffer.from(fileData));

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/files
 * List user's files with pagination and filtering
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      page = '1',
      limit = '20',
      category,
      search
    } = req.query as any;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    let whereConditions: any = (files: any, { eq, and, or, like }: any) => {
      const conditions = [
        or(
          eq(files.uploadedBy, userId),
          eq(files.isPublic, true)
        )
      ];

      if (category) {
        conditions.push(eq(files.category, category));
      }

      if (search) {
        conditions.push(
          or(
            like(files.originalName, `%${search}%`),
            like(files.filename, `%${search}%`)
          )
        );
      }

      return and(...conditions);
    };

    const userFiles = await db.query.files.findMany({
      where: whereConditions,
      limit: limitNum,
      offset,
      orderBy: (files, { desc }) => [desc(files.createdAt)]
    });

    res.json({
      success: true,
      data: {
        files: userFiles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: userFiles.length === limitNum
        }
      }
    });

  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/v1/files/:id
 * Delete file (metadata and unpin from IPFS)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const fileRecord = await db.query.files.findFirst({
      where: (files, { eq }) => eq(files.id, id)
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check permission (only owner can delete)
    if (fileRecord.uploadedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Unpin from IPFS
    try {
      await ipfsService.unpinFile(fileRecord.ipfsHash);
    } catch (error) {
      console.warn('Failed to unpin file from IPFS:', error);
    }

    // Delete from database
    await db.delete(files).where(eq(files.id, id));

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
