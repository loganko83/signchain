import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertDocumentSchema, insertSignatureRequestSchema } from "@shared/schema";
import crypto from "crypto";
import { z } from "zod";

// Mock blockchain and IPFS functions
function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateIPFSHash(): string {
  return 'Qm' + crypto.randomBytes(22).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 44);
}

function generateBlockchainTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Mock email notification
function sendEmailNotification(to: string, subject: string, message: string) {
  console.log(`Email sent to ${to}: ${subject} - ${message}`);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "사용자명이 이미 존재합니다" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "이메일이 이미 존재합니다" });
      }

      // Hash password (in production, use bcrypt)
      const hashedPassword = generateHash(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "서버 오류가 발생했습니다" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: "잘못된 사용자명 또는 비밀번호입니다" });
      }

      const hashedPassword = generateHash(loginData.password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "잘못된 사용자명 또는 비밀번호입니다" });
      }

      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "서버 오류가 발생했습니다" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "사용자 ID가 필요합니다" });
      }

      const documents = await storage.getDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "문서를 가져오는 중 오류가 발생했습니다" });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "문서를 찾을 수 없습니다" });
      }

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "문서를 가져오는 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      
      // Simulate file processing
      const fileContent = `Mock file content for ${documentData.originalFilename}`;
      const fileHash = generateHash(fileContent);
      const ipfsHash = generateIPFSHash();
      
      const document = await storage.createDocument({
        ...documentData,
        fileHash,
        ipfsHash,
      });

      // Create audit log
      await storage.createAuditLog({
        documentId: document.id,
        userId: document.uploadedBy,
        action: "문서 업로드",
        description: `${document.originalFilename} 파일이 업로드되고 블록체인에 등록되었습니다`,
        metadata: { fileSize: document.fileSize, fileType: document.fileType },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "문서 업로드 중 오류가 발생했습니다" });
    }
  });

  // Signature request routes
  app.get("/api/signature-requests", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "사용자 ID가 필요합니다" });
      }

      const requests = await storage.getSignatureRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "서명 요청을 가져오는 중 오류가 발생했습니다" });
    }
  });

  app.get("/api/signature-requests/token/:token", async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      const request = await storage.getSignatureRequestByToken(token);
      
      if (!request) {
        return res.status(404).json({ message: "서명 요청을 찾을 수 없습니다" });
      }

      const document = await storage.getDocument(request.documentId);
      res.json({ request, document });
    } catch (error) {
      res.status(500).json({ message: "서명 요청을 가져오는 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/signature-requests", async (req: Request, res: Response) => {
    try {
      const requestData = insertSignatureRequestSchema.parse(req.body);
      const shareToken = generateShareToken();
      
      const request = await storage.createSignatureRequest({
        ...requestData,
        shareToken,
      });

      // Send email notification
      const document = await storage.getDocument(request.documentId);
      if (document) {
        sendEmailNotification(
          request.signerEmail,
          "SignChain 서명 요청",
          `${request.signerName || request.signerEmail}님, ${document.title} 문서의 서명이 요청되었습니다.`
        );
      }

      // Create audit log
      await storage.createAuditLog({
        documentId: request.documentId,
        userId: request.requesterId,
        action: "서명 요청 생성",
        description: `${request.signerEmail}에게 서명 요청을 보냈습니다`,
        metadata: { signerEmail: request.signerEmail },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "서명 요청 생성 중 오류가 발생했습니다" });
    }
  });

  // Signature routes
  app.post("/api/signatures", async (req: Request, res: Response) => {
    try {
      const signatureData = req.body;
      const blockchainTxHash = generateBlockchainTxHash();
      
      const signature = await storage.createSignature({
        ...signatureData,
        blockchainTxHash,
      });

      // Update signature request status
      const requests = await storage.getSignatureRequestsByDocument(signature.documentId);
      const request = requests.find(r => r.signerEmail === signature.signerEmail);
      if (request) {
        await storage.updateSignatureRequestStatus(request.id, "완료");
      }

      // Update document status if all signatures are complete
      const allSignatures = await storage.getSignaturesByDocument(signature.documentId);
      const allRequests = await storage.getSignatureRequestsByDocument(signature.documentId);
      const completedSignatures = allSignatures.filter(s => s.isCompleted);
      
      if (completedSignatures.length === allRequests.length) {
        await storage.updateDocumentStatus(signature.documentId, "서명 완료", blockchainTxHash);
      }

      // Create audit log
      await storage.createAuditLog({
        documentId: signature.documentId,
        userId: signature.signerId,
        action: "서명 완료",
        description: `${signature.signerEmail}님이 문서에 디지털 서명을 완료했습니다`,
        metadata: { 
          signatureType: signature.signatureType,
          blockchainTxHash: signature.blockchainTxHash 
        },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

      res.json(signature);
    } catch (error) {
      res.status(500).json({ message: "서명 처리 중 오류가 발생했습니다" });
    }
  });

  // Audit routes
  app.get("/api/audit/:documentId", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const auditLogs = await storage.getAuditLogsByDocument(documentId);
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ message: "감사 로그를 가져오는 중 오류가 발생했습니다" });
    }
  });

  // Blockchain verification route
  app.post("/api/verify/:documentId", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "문서를 찾을 수 없습니다" });
      }

      // Mock blockchain verification
      const verification = {
        isValid: true,
        blockchainTxHash: document.blockchainTxHash,
        documentHash: document.fileHash,
        verifiedAt: new Date(),
        blockNumber: Math.floor(Math.random() * 1000000) + 1234567,
        gasUsed: 21000,
      };

      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: "블록체인 검증 중 오류가 발생했습니다" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
