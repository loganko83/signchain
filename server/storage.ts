import { 
  users, 
  documents, 
  signatures, 
  signatureRequests, 
  auditLogs,
  workflowTemplates,
  documentCollaborators,
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
  type DocumentCollaborator,
  type InsertDocumentCollaborator
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  
  // Workflow template methods
  getWorkflowTemplate(id: number): Promise<WorkflowTemplate | undefined>;
  getWorkflowTemplatesByUser(userId: number): Promise<WorkflowTemplate[]>;
  createWorkflowTemplate(template: InsertWorkflowTemplate): Promise<WorkflowTemplate>;
  
  // Workflow execution methods
  createWorkflowFromTemplate(templateId: number, documentId: number, requesterId: number): Promise<string>; // Returns workflowId
  getWorkflowStatus(workflowId: string): Promise<{ completed: number; total: number; currentStep?: SignatureRequest }>;
  approveSignatureRequest(requestId: number, approverId: number): Promise<void>;
  rejectSignatureRequest(requestId: number, approverId: number, reason: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.uploadedBy, userId));
  }

  async createDocument(document: InsertDocument & { fileHash: string; ipfsHash: string }): Promise<Document> {
    const [doc] = await db
      .insert(documents)
      .values({
        ...document,
        status: "업로드됨",
      })
      .returning();
    return doc;
  }

  async updateDocumentStatus(id: number, status: string, blockchainTxHash?: string): Promise<void> {
    await db
      .update(documents)
      .set({ 
        status, 
        blockchainTxHash: blockchainTxHash || undefined 
      })
      .where(eq(documents.id, id));
  }

  async getSignature(id: number): Promise<Signature | undefined> {
    const [signature] = await db.select().from(signatures).where(eq(signatures.id, id));
    return signature || undefined;
  }

  async getSignaturesByDocument(documentId: number): Promise<Signature[]> {
    return await db.select().from(signatures).where(eq(signatures.documentId, documentId));
  }

  async createSignature(signature: InsertSignature & { blockchainTxHash?: string }): Promise<Signature> {
    const [sig] = await db
      .insert(signatures)
      .values({
        ...signature,
        isCompleted: false,
      })
      .returning();
    return sig;
  }

  async updateSignatureCompletion(id: number, isCompleted: boolean): Promise<void> {
    await db
      .update(signatures)
      .set({ isCompleted })
      .where(eq(signatures.id, id));
  }

  async getSignatureRequest(id: number): Promise<SignatureRequest | undefined> {
    const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.id, id));
    return request || undefined;
  }

  async getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined> {
    const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.shareToken, token));
    return request || undefined;
  }

  async getSignatureRequestsByDocument(documentId: number): Promise<SignatureRequest[]> {
    return await db.select().from(signatureRequests).where(eq(signatureRequests.documentId, documentId));
  }

  async getSignatureRequestsByUser(userId: number): Promise<SignatureRequest[]> {
    return await db.select().from(signatureRequests).where(eq(signatureRequests.requesterId, userId));
  }

  async createSignatureRequest(request: InsertSignatureRequest & { shareToken: string }): Promise<SignatureRequest> {
    const [req] = await db
      .insert(signatureRequests)
      .values({
        ...request,
        status: "대기",
      })
      .returning();
    return req;
  }

  async updateSignatureRequestStatus(id: number, status: string): Promise<void> {
    await db
      .update(signatureRequests)
      .set({ status })
      .where(eq(signatureRequests.id, id));
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  async getAuditLogsByDocument(documentId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.documentId, documentId))
      .orderBy(auditLogs.timestamp);
  }

  // Workflow template methods
  async getWorkflowTemplate(id: number): Promise<WorkflowTemplate | undefined> {
    const [template] = await db.select().from(workflowTemplates).where(eq(workflowTemplates.id, id));
    return template || undefined;
  }

  async getWorkflowTemplatesByUser(userId: number): Promise<WorkflowTemplate[]> {
    return await db.select().from(workflowTemplates).where(eq(workflowTemplates.createdBy, userId));
  }

  async createWorkflowTemplate(template: InsertWorkflowTemplate): Promise<WorkflowTemplate> {
    const [result] = await db
      .insert(workflowTemplates)
      .values(template)
      .returning();
    return result;
  }

  // Workflow execution methods
  async createWorkflowFromTemplate(templateId: number, documentId: number, requesterId: number): Promise<string> {
    const template = await this.getWorkflowTemplate(templateId);
    if (!template) throw new Error("Workflow template not found");
    
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const steps = template.steps as any;
    
    if (steps.steps && Array.isArray(steps.steps)) {
      for (const step of steps.steps) {
        await this.createSignatureRequest({
          documentId,
          requesterId,
          signerEmail: step.email,
          signerName: step.name,
          signatureOrder: step.order,
          isSequential: steps.isSequential || false,
          workflowId,
          approvalRequired: step.type === 'approver',
          shareToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          deadline: step.deadline ? new Date(Date.now() + parseInt(step.deadline) * 24 * 60 * 60 * 1000) : undefined,
        });
      }
    }
    
    return workflowId;
  }

  async getWorkflowStatus(workflowId: string): Promise<{ completed: number; total: number; currentStep?: SignatureRequest }> {
    const requests = await db.select().from(signatureRequests).where(eq(signatureRequests.workflowId, workflowId));
    const completed = requests.filter(r => r.status === "완료").length;
    const currentStep = requests.find(r => r.status === "대기");
    
    return {
      completed,
      total: requests.length,
      currentStep: currentStep || undefined
    };
  }

  async approveSignatureRequest(requestId: number, approverId: number): Promise<void> {
    await db
      .update(signatureRequests)
      .set({ 
        status: "승인됨",
        approvedBy: approverId,
        approvedAt: new Date()
      })
      .where(eq(signatureRequests.id, requestId));
  }

  async rejectSignatureRequest(requestId: number, approverId: number, reason: string): Promise<void> {
    await db
      .update(signatureRequests)
      .set({ 
        status: "거부됨",
        rejectedBy: approverId,
        rejectedAt: new Date(),
        rejectionReason: reason
      })
      .where(eq(signatureRequests.id, requestId));
  }
}

export const storage = new DatabaseStorage();
