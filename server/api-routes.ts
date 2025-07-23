import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { apiAuthMiddleware } from "./api-keys";
import { insertDocumentSchema, insertSignatureRequestSchema } from "@shared/schema";
import { z } from "zod";

// External API routes for third-party integrations
export function registerApiRoutes(app: Express) {
  // API prefix for all external API endpoints
  const API_PREFIX = "/api/v1";

  // Document management API
  app.get(`${API_PREFIX}/documents`, apiAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;

      // For demo purposes, get all documents - in production, filter by API key permissions
      const documents = await storage.getAllDocuments();
      
      const paginatedDocs = documents.slice(offset, offset + limit);
      const total = documents.length;

      res.json({
        data: paginatedDocs.map(doc => ({
          id: doc.id,
          title: doc.title,
          status: doc.status,
          fileHash: doc.fileHash,
          ipfsHash: doc.ipfsHash,
          blockchainTxHash: doc.blockchainTxHash,
          createdAt: doc.createdAt,
          uploadedBy: doc.uploadedBy
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("API Documents list error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to retrieve documents"
      });
    }
  });

  app.get(`${API_PREFIX}/documents/:id`, apiAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document) {
        return res.status(404).json({
          error: "Document not found",
          message: `Document with ID ${documentId} does not exist`
        });
      }

      res.json({
        data: {
          id: document.id,
          title: document.title,
          description: document.description,
          status: document.status,
          fileHash: document.fileHash,
          ipfsHash: document.ipfsHash,
          blockchainTxHash: document.blockchainTxHash,
          createdAt: document.createdAt,
          uploadedBy: document.uploadedBy
        }
      });
    } catch (error) {
      console.error("API Document get error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to retrieve document"
      });
    }
  });

  // Document upload API
  app.post(`${API_PREFIX}/documents`, apiAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const createDocumentSchema = z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        fileContent: z.string().min(1, "File content is required"), // Base64 encoded
        mimeType: z.string().min(1, "MIME type is required")
      });

      const validatedData = createDocumentSchema.parse(req.body);
      
      // Decode base64 content and create hash
      const fileBuffer = Buffer.from(validatedData.fileContent, 'base64');
      const fileHash = require('crypto').createHash('sha256').update(fileBuffer).digest('hex');
      
      // Generate mock IPFS and blockchain hashes
      const ipfsHash = 'Qm' + require('crypto').randomBytes(22).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
      const blockchainTxHash = '0x' + require('crypto').randomBytes(32).toString('hex');

      const document = await storage.createDocument({
        title: validatedData.title,
        description: validatedData.description || "",
        originalFilename: `${validatedData.title}.${validatedData.mimeType.split('/')[1]}`,
        fileSize: fileBuffer.length,
        fileType: validatedData.mimeType,
        category: "api-upload",
        fileHash,
        ipfsHash,
        blockchainTxHash,
        uploadedBy: 1 // API user - should be determined from API key
      });

      res.status(201).json({
        data: {
          id: document.id,
          title: document.title,
          description: document.description,
          status: document.status,
          fileHash: document.fileHash,
          ipfsHash: document.ipfsHash,
          blockchainTxHash: document.blockchainTxHash,
          createdAt: document.createdAt
        },
        message: "Document created successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          message: "Invalid request data",
          details: error.errors
        });
      }
      
      console.error("API Document create error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create document"
      });
    }
  });

  // Signature request API
  app.post(`${API_PREFIX}/documents/:id/signature-requests`, apiAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document) {
        return res.status(404).json({
          error: "Document not found",
          message: `Document with ID ${documentId} does not exist`
        });
      }

      const createSignatureRequestSchema = z.object({
        signerEmail: z.string().email("Valid email is required"),
        signerName: z.string().optional(),
        message: z.string().optional(),
        deadline: z.string().datetime().optional(),
        requiredActions: z.array(z.string()).optional()
      });

      const validatedData = createSignatureRequestSchema.parse(req.body);
      
      const signatureRequest = await storage.createSignatureRequest({
        documentId,
        signerEmail: validatedData.signerEmail,
        signerName: validatedData.signerName,
        message: validatedData.message,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
        shareToken: require('crypto').randomBytes(32).toString('hex'),
        requesterId: 1 // API user
      });

      res.status(201).json({
        data: {
          id: signatureRequest.id,
          documentId: signatureRequest.documentId,
          signerEmail: signatureRequest.signerEmail,
          signerName: signatureRequest.signerName,
          status: signatureRequest.status,
          shareToken: signatureRequest.shareToken,
          message: signatureRequest.message,
          deadline: signatureRequest.deadline,
          createdAt: signatureRequest.createdAt
        },
        message: "Signature request created successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          message: "Invalid request data",
          details: error.errors
        });
      }
      
      console.error("API Signature request create error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create signature request"
      });
    }
  });

  // Get signature requests for a document
  app.get(`${API_PREFIX}/documents/:id/signature-requests`, apiAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const signatureRequests = await storage.getSignatureRequestsByDocument(documentId);

      res.json({
        data: signatureRequests.map(request => ({
          id: request.id,
          documentId: request.documentId,
          signerEmail: request.signerEmail,
          signerName: request.signerName,
          status: request.status,
          message: request.message,
          deadline: request.deadline,
          createdAt: request.createdAt
        }))
      });
    } catch (error) {
      console.error("API Signature requests get error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to retrieve signature requests"
      });
    }
  });

  // Get document signatures
  app.get(`${API_PREFIX}/documents/:id/signatures`, apiAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const signatures = await storage.getSignaturesByDocument(documentId);

      res.json({
        data: signatures.map(signature => ({
          id: signature.id,
          documentId: signature.documentId,
          signerEmail: signature.signerEmail,
          signatureType: signature.signatureType,
          signatureData: signature.signatureData,
          blockchainTxHash: signature.blockchainTxHash,
          signedAt: signature.signedAt
        }))
      });
    } catch (error) {
      console.error("API Signatures get error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to retrieve signatures"
      });
    }
  });

  // Blockchain verification API
  app.get(`${API_PREFIX}/documents/:id/verification`, apiAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({
          error: "Document not found",
          message: `Document with ID ${documentId} does not exist`
        });
      }

      // Mock blockchain verification
      const verification = {
        isValid: true,
        documentHash: document.fileHash,
        blockchainTxHash: document.blockchainTxHash,
        ipfsHash: document.ipfsHash,
        verifiedAt: new Date(),
        blockNumber: Math.floor(Math.random() * 1000000) + 1234567,
        networkId: 137, // Polygon
        gasUsed: 21000,
        confirmations: Math.floor(Math.random() * 100) + 10
      };

      res.json({
        data: verification,
        message: "Document verification completed"
      });
    } catch (error) {
      console.error("API Verification error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to verify document"
      });
    }
  });

  // Webhook management API
  app.post(`${API_PREFIX}/webhooks`, apiAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const createWebhookSchema = z.object({
        url: z.string().url("Valid URL is required"),
        events: z.array(z.string()).min(1, "At least one event type is required"),
        secret: z.string().optional()
      });

      const validatedData = createWebhookSchema.parse(req.body);
      const secret = validatedData.secret || require('crypto').randomBytes(32).toString('hex');

      // Store webhook (for demo, we'll mock this)
      const webhook = {
        id: Math.floor(Math.random() * 10000),
        url: validatedData.url,
        events: validatedData.events,
        secret,
        isActive: true,
        createdAt: new Date()
      };

      res.status(201).json({
        data: webhook,
        message: "Webhook created successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          message: "Invalid request data",
          details: error.errors
        });
      }
      
      console.error("API Webhook create error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create webhook"
      });
    }
  });

  // API health check
  app.get(`${API_PREFIX}/health`, (req: Request, res: Response) => {
    res.json({
      status: "healthy",
      timestamp: new Date(),
      version: "1.0.0",
      uptime: process.uptime()
    });
  });

  // API rate limit info
  app.get(`${API_PREFIX}/rate-limit`, apiAuthMiddleware, (req: Request, res: Response) => {
    res.json({
      limit: 100,
      remaining: parseInt(res.get('X-RateLimit-Remaining') || '100'),
      reset: parseInt(res.get('X-RateLimit-Reset') || '0'),
      windowMs: 60000
    });
  });

  console.log("External API routes registered at /api/v1");
}