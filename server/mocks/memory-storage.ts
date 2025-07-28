import { 
  type User,
  type InsertUser,
  type Document,
  type InsertDocument,
  type Signature,
  type InsertSignature,
  type SignatureRequest,
  type InsertSignatureRequest,
  type AuditLog,
  type WorkflowTemplate,
  type InsertWorkflowTemplate,
  type Notification,
  type InsertNotification,
  type UserSecurity,
  type InsertUserSecurity,
  type BlockchainTransaction,
  type InsertBlockchainTransaction,
} from "@shared/schema";
import { IStorage } from "../storage";
import crypto from "crypto";

// In-memory data storage
const usersData: Map<number, User> = new Map();
const documentsData: Map<number, Document> = new Map();
const signaturesData: Map<number, Signature> = new Map();
const signatureRequestsData: Map<number, SignatureRequest> = new Map();
const auditLogsData: Map<number, AuditLog> = new Map();
const workflowTemplatesData: Map<number, WorkflowTemplate> = new Map();
const notificationsData: Map<number, Notification> = new Map();
const userSecurityData: Map<number, UserSecurity> = new Map();
const blockchainTransactionsData: Map<string, BlockchainTransaction> = new Map();

// Mock ID counters
let userIdCounter = 1;
let documentIdCounter = 1;
let signatureIdCounter = 1;
let signatureRequestIdCounter = 1;
let auditLogIdCounter = 1;
let workflowTemplateIdCounter = 1;
let notificationIdCounter = 1;
let userSecurityIdCounter = 1;

function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Create test users
const testPassword = generateHash("password123");
const testUsers = [
  {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    name: "Test User",
    password: testPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    username: "admin",
    email: "admin@example.com",
    name: "Admin User",
    password: testPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Initialize test data
testUsers.forEach(user => {
  usersData.set(user.id, user);
  userIdCounter = Math.max(userIdCounter, user.id + 1);
});

export class MemoryStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(usersData.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(usersData.values()).find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: userIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    usersData.set(newUser.id, newUser);
    return newUser;
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return documentsData.get(id);
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(documentsData.values()).filter(d => d.uploadedBy === userId);
  }

  async createDocument(document: InsertDocument & { fileHash: string; ipfsHash: string }): Promise<Document> {
    const newDoc: Document = {
      ...document,
      id: documentIdCounter++,
      status: "업로드됨",
      uploadedAt: new Date(),
      updatedAt: new Date()
    };
    documentsData.set(newDoc.id, newDoc);
    return newDoc;
  }

  async updateDocumentStatus(id: number, status: string, blockchainTxHash?: string): Promise<void> {
    const doc = documentsData.get(id);
    if (doc) {
      doc.status = status;
      if (blockchainTxHash) {
        doc.blockchainTxHash = blockchainTxHash;
      }
      doc.updatedAt = new Date();
    }
  }

  // Signature methods
  async getSignature(id: number): Promise<Signature | undefined> {
    return signaturesData.get(id);
  }

  async getSignaturesByDocument(documentId: number): Promise<Signature[]> {
    return Array.from(signaturesData.values()).filter(s => s.documentId === documentId);
  }

  async createSignature(signature: InsertSignature & { blockchainTxHash?: string }): Promise<Signature> {
    const newSig: Signature = {
      ...signature,
      id: signatureIdCounter++,
      isCompleted: true,
      blockchainTxHash: signature.blockchainTxHash || null,
      signedAt: new Date(),
      createdAt: new Date()
    };
    signaturesData.set(newSig.id, newSig);
    return newSig;
  }

  async updateSignatureCompletion(id: number, isCompleted: boolean): Promise<void> {
    const sig = signaturesData.get(id);
    if (sig) {
      sig.isCompleted = isCompleted;
    }
  }

  // Signature request methods
  async getSignatureRequest(id: number): Promise<SignatureRequest | undefined> {
    return signatureRequestsData.get(id);
  }

  async getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined> {
    return Array.from(signatureRequestsData.values()).find(r => r.shareToken === token);
  }

  async getSignatureRequestsByDocument(documentId: number): Promise<SignatureRequest[]> {
    return Array.from(signatureRequestsData.values()).filter(r => r.documentId === documentId);
  }

  async getSignatureRequestsByUser(userId: number): Promise<SignatureRequest[]> {
    return Array.from(signatureRequestsData.values()).filter(r => r.requesterId === userId);
  }

  async createSignatureRequest(request: InsertSignatureRequest & { shareToken: string }): Promise<SignatureRequest> {
    const newReq: SignatureRequest = {
      ...request,
      id: signatureRequestIdCounter++,
      status: "대기 중",
      requestedAt: new Date(),
      updatedAt: new Date()
    };
    signatureRequestsData.set(newReq.id, newReq);
    return newReq;
  }

  async updateSignatureRequestStatus(id: number, status: string): Promise<void> {
    const req = signatureRequestsData.get(id);
    if (req) {
      req.status = status;
      req.updatedAt = new Date();
    }
  }

  // Audit log methods
  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...log,
      id: auditLogIdCounter++,
      timestamp: new Date()
    };
    auditLogsData.set(newLog.id, newLog);
    return newLog;
  }

  async getAuditLogsByDocument(documentId: number): Promise<AuditLog[]> {
    return Array.from(auditLogsData.values())
      .filter(log => log.documentId === documentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Workflow template methods
  async getWorkflowTemplate(id: number): Promise<WorkflowTemplate | undefined> {
    return workflowTemplatesData.get(id);
  }

  async getWorkflowTemplatesByUser(userId: number): Promise<WorkflowTemplate[]> {
    return Array.from(workflowTemplatesData.values()).filter(t => t.createdBy === userId);
  }

  async createWorkflowTemplate(template: InsertWorkflowTemplate): Promise<WorkflowTemplate> {
    const newTemplate: WorkflowTemplate = {
      ...template,
      id: workflowTemplateIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    workflowTemplatesData.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  // Workflow execution methods
  async createWorkflowFromTemplate(templateId: number, documentId: number, requesterId: number): Promise<string> {
    // Mock implementation
    return `workflow-${Date.now()}`;
  }

  async getWorkflowStatus(workflowId: string): Promise<{ completed: number; total: number; currentStep?: SignatureRequest }> {
    // Mock implementation
    return { completed: 0, total: 0 };
  }

  async approveSignatureRequest(requestId: number, approverId: number): Promise<void> {
    await this.updateSignatureRequestStatus(requestId, "승인됨");
  }

  async rejectSignatureRequest(requestId: number, approverId: number, reason: string): Promise<void> {
    await this.updateSignatureRequestStatus(requestId, "거부됨");
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotif: Notification = {
      ...notification,
      id: notificationIdCounter++,
      isRead: false,
      createdAt: new Date()
    };
    notificationsData.set(newNotif.id, newNotif);
    return newNotif;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(notificationsData.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(notificationsData.values())
      .filter(n => n.userId === userId && !n.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    const notif = notificationsData.get(notificationId);
    if (notif && notif.userId === userId) {
      notif.isRead = true;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    Array.from(notificationsData.values())
      .filter(n => n.userId === userId)
      .forEach(n => n.isRead = true);
  }

  // Security methods
  async getUserSecurity(userId: number): Promise<UserSecurity | undefined> {
    return Array.from(userSecurityData.values()).find(s => s.userId === userId);
  }

  async createUserSecurity(security: InsertUserSecurity): Promise<UserSecurity> {
    const newSecurity: UserSecurity = {
      ...security,
      id: userSecurityIdCounter++,
      twoFactorEnabled: false,
      biometricEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    userSecurityData.set(newSecurity.id, newSecurity);
    return newSecurity;
  }

  async updateUserSecurity(userId: number, updates: Partial<InsertUserSecurity>): Promise<void> {
    const security = await this.getUserSecurity(userId);
    if (security) {
      Object.assign(security, updates);
      security.updatedAt = new Date();
    }
  }

  // Blockchain methods
  async createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    const newTx: BlockchainTransaction = {
      ...transaction,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    blockchainTransactionsData.set(newTx.transactionHash, newTx);
    return newTx;
  }

  async getBlockchainTransactionsByDocument(documentId: number): Promise<BlockchainTransaction[]> {
    return Array.from(blockchainTransactionsData.values())
      .filter(tx => tx.documentId === documentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateBlockchainTransactionStatus(
    transactionHash: string, 
    status: string, 
    blockNumber?: number, 
    gasUsed?: string, 
    gasFee?: string
  ): Promise<void> {
    const tx = blockchainTransactionsData.get(transactionHash);
    if (tx) {
      tx.status = status;
      if (blockNumber) tx.blockNumber = blockNumber;
      if (gasUsed) tx.gasUsed = gasUsed;
      if (gasFee) tx.gasFee = gasFee;
      tx.updatedAt = new Date();
    }
  }

  // Helper methods
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(documentsData.values());
  }
}

// Export singleton instance
export const memoryStorage = new MemoryStorage();
