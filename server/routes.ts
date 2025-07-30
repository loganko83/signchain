import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertDocumentSchema, insertSignatureRequestSchema, insertSignatureSchema, insertWorkflowTemplateSchema } from "@shared/schema";
import { sendSignatureRequestEmail, sendCompletionEmail } from "./email";
import { generateDocumentPackage, type DocumentDownloadOptions } from "./pdf-generator";
import { setupWebSocket, NotificationService } from "./websocket";
import { registerApiRoutes } from "./api-routes";
import { SecurityHelpers } from "./security";
import { authenticateToken, optionalAuth, getCurrentUserId, requireCurrentUserId } from "./auth/jwt-auth";
import { login, logout, refreshToken, getCurrentUser } from "./auth/auth-routes";
import crypto from "crypto";
import { z } from "zod";

// Hash functions for document integrity (SHA-256 is appropriate for this use case)
function generateDocumentHash(data: string): string {
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
  const httpServer = createServer(app);
  
  // Setup WebSocket with real-time notifications
  const io = setupWebSocket(httpServer);
  (global as any).notificationService = new NotificationService(io);
  
  // Register external API routes
  registerApiRoutes(app);
  
  // Import and register module-specific routes
  const moduleRoutes = await import("./module-routes");
  app.use("/api/modules", moduleRoutes.default);
  
  // Import and register DID routes
  const didRoutes = await import("./routes/did");
  app.use("/api/did", didRoutes.default);
  
  // Import and register Files routes (IPFS)
  const filesRoutes = await import("./routes/files");
  app.use("/api/v1/files", filesRoutes.default);
  
  // Import and register IPFS routes
  const ipfsRoutes = await import("./routes/ipfs");
  app.use("/api/v1/ipfs", ipfsRoutes.default);
  
  // Authentication routes with JWT
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.post("/api/auth/refresh", refreshToken);
  app.get("/api/auth/me", authenticateToken, getCurrentUser);
  
  // Legacy authentication routes (for backward compatibility)
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

      // Hash password using bcrypt
      const hashedPassword = await SecurityHelpers.hashPassword(userData.password);
      
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

      const isPasswordValid = await SecurityHelpers.verifyPassword(loginData.password, user.password);
      if (!isPasswordValid) {
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
      const fileHash = generateDocumentHash(fileContent);
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

      // Send real email notification  
      const document = await storage.getDocument(request.documentId);
      const requester = await storage.getUser(request.requesterId);
      
      if (document && requester) {
        const signatureUrl = `${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://your-domain.replit.app'}/sign/${shareToken}`;
        
        const emailSent = await sendSignatureRequestEmail({
          to: request.signerEmail,
          signerName: request.signerName || undefined,
          requesterName: requester.name,
          documentTitle: document.title,
          signatureUrl,
          deadline: request.deadline || undefined,
          message: request.message || undefined,
        });

        console.log(`Email ${emailSent ? 'sent successfully' : 'failed'} to ${request.signerEmail}`);
        
        // Update document status to signature pending
        await storage.updateDocumentStatus(request.documentId, "서명 대기", undefined);
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
        
        // Send completion emails to all participants
        const document = await storage.getDocument(signature.documentId);
        if (document) {
          // Send to requester
          const requester = await storage.getUser(document.uploadedBy);
          if (requester) {
            await sendCompletionEmail({
              to: requester.email,
              documentTitle: document.title,
              blockchainTxHash,
            });
          }
          
          // Send to all signers
          for (const request of allRequests) {
            await sendCompletionEmail({
              to: request.signerEmail,
              documentTitle: document.title,
              blockchainTxHash,
            });
          }
        }
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

  // Get signature requests by token
  app.get("/api/signature-requests/token/:token", async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      const request = await storage.getSignatureRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "서명 요청을 찾을 수 없습니다" });
      }
      res.json(request);
    } catch (error) {
      console.error("Get signature request by token error:", error);
      res.status(500).json({ error: "서명 요청을 가져오는 중 오류가 발생했습니다" });
    }
  });

  // Download document with signatures as PDF
  app.get("/api/documents/:id/download", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const format = (req.query.format as string) || 'pdf';
      const includeSignatures = req.query.signatures === 'true';
      const includeAuditTrail = req.query.audit === 'true';
      const includeBlockchainProof = req.query.blockchain === 'true';

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "문서를 찾을 수 없습니다" });
      }

      const signatures = includeSignatures ? await storage.getSignaturesByDocument(documentId) : [];

      const options: DocumentDownloadOptions = {
        includeSignatures,
        includeAuditTrail,
        includeBlockchainProof,
        format: format as 'pdf' | 'json' | 'xml'
      };

      const result = await generateDocumentPackage(document, signatures, options);

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.content);

      // Create audit log for download
      await storage.createAuditLog({
        documentId,
        userId: null,
        action: "문서 다운로드",
        description: `${format.toUpperCase()} 형식으로 문서를 다운로드했습니다`,
        metadata: { format, options },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });

    } catch (error) {
      console.error('Document download error:', error);
      res.status(500).json({ message: "문서 다운로드 중 오류가 발생했습니다" });
    }
  });

  // Workflow template routes
  app.get("/api/workflow-templates", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "사용자 ID가 필요합니다" });
      }
      
      const templates = await storage.getWorkflowTemplatesByUser(userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "워크플로우 템플릿을 가져오는 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/workflow-templates", async (req: Request, res: Response) => {
    try {
      const templateData = insertWorkflowTemplateSchema.parse(req.body);
      const template = await storage.createWorkflowTemplate(templateData);
      
      // Create audit log
      await storage.createAuditLog({
        documentId: null,
        userId: templateData.createdBy,
        action: "워크플로우 템플릿 생성",
        description: `새로운 워크플로우 템플릿 "${templateData.name}"을 생성했습니다`,
        metadata: { templateId: template.id, stepCount: (templateData.steps as any)?.steps?.length || 0 },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });
      
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "워크플로우 템플릿 생성 중 오류가 발생했습니다" });
    }
  });

  // Workflow execution routes
  app.post("/api/workflows/create", async (req: Request, res: Response) => {
    try {
      const { templateId, documentId, requesterId } = req.body;
      
      if (!templateId || !documentId || !requesterId) {
        return res.status(400).json({ message: "필수 필드가 누락되었습니다" });
      }
      
      const workflowId = await storage.createWorkflowFromTemplate(
        parseInt(templateId), 
        parseInt(documentId), 
        parseInt(requesterId)
      );
      
      // Create audit log
      await storage.createAuditLog({
        documentId: parseInt(documentId),
        userId: parseInt(requesterId),
        action: "협업 워크플로우 시작",
        description: `템플릿을 사용하여 새로운 협업 워크플로우를 시작했습니다`,
        metadata: { workflowId, templateId },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });
      
      res.json({ workflowId });
    } catch (error) {
      console.error('Workflow creation error:', error);
      res.status(500).json({ message: "워크플로우 생성 중 오류가 발생했습니다" });
    }
  });

  app.get("/api/workflows/:workflowId/status", async (req: Request, res: Response) => {
    try {
      const workflowId = req.params.workflowId;
      const status = await storage.getWorkflowStatus(workflowId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "워크플로우 상태를 가져오는 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/signature-requests/:id/approve", async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const { approverId } = req.body;
      
      if (!approverId) {
        return res.status(400).json({ message: "승인자 ID가 필요합니다" });
      }
      
      await storage.approveSignatureRequest(requestId, parseInt(approverId));
      
      // Create audit log
      await storage.createAuditLog({
        documentId: null, // Would need to get from request
        userId: parseInt(approverId),
        action: "서명 요청 승인",
        description: `서명 요청을 승인했습니다`,
        metadata: { requestId },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });
      
      res.json({ message: "서명 요청이 승인되었습니다" });
    } catch (error) {
      res.status(500).json({ message: "승인 처리 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/signature-requests/:id/reject", async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const { approverId, reason } = req.body;
      
      if (!approverId || !reason) {
        return res.status(400).json({ message: "승인자 ID와 거부 사유가 필요합니다" });
      }
      
      await storage.rejectSignatureRequest(requestId, parseInt(approverId), reason);
      
      // Create audit log
      await storage.createAuditLog({
        documentId: null, // Would need to get from request
        userId: parseInt(approverId),
        action: "서명 요청 거부",
        description: `서명 요청을 거부했습니다: ${reason}`,
        metadata: { requestId, reason },
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
      });
      
      res.json({ message: "서명 요청이 거부되었습니다" });
    } catch (error) {
      res.status(500).json({ message: "거부 처리 중 오류가 발생했습니다" });
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

  // Notification routes (protected with authentication)
  app.get("/api/notifications", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = requireCurrentUserId(req);
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "알림을 가져올 수 없습니다" });
    }
  });

  app.post("/api/notifications/:id/read", authenticateToken, async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = requireCurrentUserId(req);
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "알림 읽음 처리 실패" });
    }
  });

  app.post("/api/notifications/mark-all-read", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = requireCurrentUserId(req);
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "모든 알림 읽음 처리 실패" });
    }
  });

  // Security routes
  app.get("/api/security/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      let security = await storage.getUserSecurity(userId);
      
      if (!security) {
        security = await storage.createUserSecurity({ userId });
      }
      
      res.json({
        twoFactorEnabled: security.twoFactorEnabled,
        biometricEnabled: security.biometricEnabled,
        lastLoginAt: security.lastLoginAt,
      });
    } catch (error) {
      res.status(500).json({ message: "보안 설정을 가져올 수 없습니다" });
    }
  });

  // 2FA Setup (protected with authentication)
  app.post("/api/security/2fa/setup", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = requireCurrentUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
      }

      const { TwoFactorAuth } = await import("./security");
      const { secret, qrCodeUrl } = TwoFactorAuth.generateSecret(user.email);
      const qrCode = await TwoFactorAuth.generateQRCode(secret, user.email);

      // Store secret temporarily
      await storage.updateUserSecurity(userId, { twoFactorSecret: secret });

      res.json({ qrCode, secret });
    } catch (error) {
      console.error("2FA 설정 오류:", error);
      res.status(500).json({ message: "2FA 설정 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/security/2fa/enable", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = requireCurrentUserId(req);
      const { token } = req.body;

      const { TwoFactorAuth } = await import("./security");
      const result = await TwoFactorAuth.enableTwoFactor(userId, token);

      res.json(result);
    } catch (error) {
      console.error("2FA 활성화 오류:", error);
      res.status(500).json({ message: "2FA 활성화 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/security/2fa/disable", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = requireCurrentUserId(req);
      await storage.updateUserSecurity(userId, { 
        twoFactorEnabled: false,
        twoFactorSecret: null 
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "2FA 비활성화 실패" });
    }
  });

  // Biometric Authentication (protected with authentication)
  app.post("/api/security/biometric/register-options", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = requireCurrentUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
      }

      const { BiometricAuth } = await import("./security");
      const options = await BiometricAuth.generateRegistrationOptions(userId, user.email);

      res.json(options);
    } catch (error) {
      console.error("생체 인증 등록 옵션 생성 오류:", error);
      res.status(500).json({ message: "생체 인증 설정 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/security/biometric/register-verify", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = requireCurrentUserId(req);
      const credential = req.body;

      const { BiometricAuth } = await import("./security");
      const result = await BiometricAuth.verifyRegistration(userId, credential);

      res.json(result);
    } catch (error) {
      console.error("생체 인증 등록 검증 오류:", error);
      res.status(500).json({ message: "생체 인증 등록 중 오류가 발생했습니다" });
    }
  });

  app.post("/api/security/biometric/disable", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = requireCurrentUserId(req);
      await storage.updateUserSecurity(userId, { 
        biometricEnabled: false,
        biometricPublicKey: null 
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "생체 인증 비활성화 실패" });
    }
  });

  return httpServer;
}
