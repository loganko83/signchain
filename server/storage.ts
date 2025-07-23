import { 
  users, 
  documents, 
  signatures, 
  signatureRequests, 
  auditLogs,
  type User, 
  type InsertUser,
  type Document,
  type InsertDocument,
  type Signature,
  type InsertSignature,
  type SignatureRequest,
  type InsertSignatureRequest,
  type AuditLog
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument & { fileHash: string; ipfsHash: string }): Promise<Document>;
  updateDocumentStatus(id: number, status: string, blockchainTxHash?: string): Promise<void>;
  
  // Signature methods
  getSignature(id: number): Promise<Signature | undefined>;
  getSignaturesByDocument(documentId: number): Promise<Signature[]>;
  createSignature(signature: InsertSignature & { blockchainTxHash?: string }): Promise<Signature>;
  updateSignatureCompletion(id: number, isCompleted: boolean): Promise<void>;
  
  // Signature request methods
  getSignatureRequest(id: number): Promise<SignatureRequest | undefined>;
  getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined>;
  getSignatureRequestsByDocument(documentId: number): Promise<SignatureRequest[]>;
  getSignatureRequestsByUser(userId: number): Promise<SignatureRequest[]>;
  createSignatureRequest(request: InsertSignatureRequest & { shareToken: string }): Promise<SignatureRequest>;
  updateSignatureRequestStatus(id: number, status: string): Promise<void>;
  
  // Audit log methods
  createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
  getAuditLogsByDocument(documentId: number): Promise<AuditLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private signatures: Map<number, Signature>;
  private signatureRequests: Map<number, SignatureRequest>;
  private auditLogs: Map<number, AuditLog>;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentSignatureId: number;
  private currentSignatureRequestId: number;
  private currentAuditLogId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.signatures = new Map();
    this.signatureRequests = new Map();
    this.auditLogs = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentSignatureId = 1;
    this.currentSignatureRequestId = 1;
    this.currentAuditLogId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.uploadedBy === userId);
  }

  async createDocument(document: InsertDocument & { fileHash: string; ipfsHash: string }): Promise<Document> {
    const id = this.currentDocumentId++;
    const doc: Document = {
      ...document,
      id,
      description: document.description || null,
      blockchainTxHash: null,
      status: "업로드됨",
      createdAt: new Date(),
    };
    this.documents.set(id, doc);
    return doc;
  }

  async updateDocumentStatus(id: number, status: string, blockchainTxHash?: string): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      this.documents.set(id, { ...document, status, blockchainTxHash: blockchainTxHash || document.blockchainTxHash });
    }
  }

  async getSignature(id: number): Promise<Signature | undefined> {
    return this.signatures.get(id);
  }

  async getSignaturesByDocument(documentId: number): Promise<Signature[]> {
    return Array.from(this.signatures.values()).filter(sig => sig.documentId === documentId);
  }

  async createSignature(signature: InsertSignature & { blockchainTxHash?: string }): Promise<Signature> {
    const id = this.currentSignatureId++;
    const sig: Signature = {
      ...signature,
      id,
      blockchainTxHash: signature.blockchainTxHash || null,
      signedAt: new Date(),
      isCompleted: false,
    };
    this.signatures.set(id, sig);
    return sig;
  }

  async updateSignatureCompletion(id: number, isCompleted: boolean): Promise<void> {
    const signature = this.signatures.get(id);
    if (signature) {
      this.signatures.set(id, { ...signature, isCompleted });
    }
  }

  async getSignatureRequest(id: number): Promise<SignatureRequest | undefined> {
    return this.signatureRequests.get(id);
  }

  async getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined> {
    return Array.from(this.signatureRequests.values()).find(req => req.shareToken === token);
  }

  async getSignatureRequestsByDocument(documentId: number): Promise<SignatureRequest[]> {
    return Array.from(this.signatureRequests.values()).filter(req => req.documentId === documentId);
  }

  async getSignatureRequestsByUser(userId: number): Promise<SignatureRequest[]> {
    return Array.from(this.signatureRequests.values()).filter(req => req.requesterId === userId);
  }

  async createSignatureRequest(request: InsertSignatureRequest & { shareToken: string }): Promise<SignatureRequest> {
    const id = this.currentSignatureRequestId++;
    const req: SignatureRequest = {
      ...request,
      id,
      message: request.message || null,
      signerName: request.signerName || null,
      deadline: request.deadline || null,
      status: "대기",
      createdAt: new Date(),
    };
    this.signatureRequests.set(id, req);
    return req;
  }

  async updateSignatureRequestStatus(id: number, status: string): Promise<void> {
    const request = this.signatureRequests.get(id);
    if (request) {
      this.signatureRequests.set(id, { ...request, status });
    }
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const id = this.currentAuditLogId++;
    const auditLog: AuditLog = {
      ...log,
      id,
      timestamp: new Date(),
    };
    this.auditLogs.set(id, auditLog);
    return auditLog;
  }

  async getAuditLogsByDocument(documentId: number): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.documentId === documentId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }
}

export const storage = new MemStorage();
