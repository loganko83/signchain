import { 
  users, 
  documents, 
  signatures, 
  signatureRequests, 
  auditLogs,
  workflowTemplates,
  documentCollaborators,
  notifications,
  userSecurity,
  blockchainTransactions,
  organizations,
  organizationMembers,
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
  type InsertDocumentCollaborator,
  type Notification,
  type InsertNotification,
  type UserSecurity,
  type InsertUserSecurity,
  type BlockchainTransaction,
  type InsertBlockchainTransaction,
  type Organization,
  type InsertOrganization,
  type OrganizationMember,
  type InsertOrganizationMember
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number, userId: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Security methods
  getUserSecurity(userId: number): Promise<UserSecurity | undefined>;
  createUserSecurity(security: InsertUserSecurity): Promise<UserSecurity>;
  updateUserSecurity(userId: number, updates: Partial<InsertUserSecurity>): Promise<void>;
  
  // Blockchain methods
  createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction>;
  getBlockchainTransactionsByDocument(documentId: number): Promise<BlockchainTransaction[]>;
  updateBlockchainTransactionStatus(transactionHash: string, status: string, blockNumber?: number, gasUsed?: string, gasFee?: string): Promise<void>;
  
  // Helper methods for API
  getAllDocuments(): Promise<Document[]>;
  getSignaturesByDocument(documentId: number): Promise<Signature[]>;
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

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return result;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Security methods
  async getUserSecurity(userId: number): Promise<UserSecurity | undefined> {
    const [security] = await db
      .select()
      .from(userSecurity)
      .where(eq(userSecurity.userId, userId));
    return security || undefined;
  }

  async createUserSecurity(security: InsertUserSecurity): Promise<UserSecurity> {
    const [result] = await db
      .insert(userSecurity)
      .values(security)
      .returning();
    return result;
  }

  async updateUserSecurity(userId: number, updates: Partial<InsertUserSecurity>): Promise<void> {
    await db
      .update(userSecurity)
      .set(updates)
      .where(eq(userSecurity.userId, userId));
  }

  // Blockchain methods
  async createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    const [result] = await db
      .insert(blockchainTransactions)
      .values(transaction)
      .returning();
    return result;
  }

  async getBlockchainTransactionsByDocument(documentId: number): Promise<BlockchainTransaction[]> {
    return await db
      .select()
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.documentId, documentId))
      .orderBy(desc(blockchainTransactions.createdAt));
  }

  async updateBlockchainTransactionStatus(
    transactionHash: string, 
    status: string, 
    blockNumber?: number, 
    gasUsed?: string, 
    gasFee?: string
  ): Promise<void> {
    const updates: any = { status };
    if (blockNumber) updates.blockNumber = blockNumber;
    if (gasUsed) updates.gasUsed = gasUsed;
    if (gasFee) updates.gasFee = gasFee;
    if (status === 'confirmed') updates.confirmedAt = new Date();

    await db
      .update(blockchainTransactions)
      .set(updates)
      .where(eq(blockchainTransactions.transactionHash, transactionHash));
  }

  // Helper methods for API
  async getAllDocuments(): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt));
  }

  async getSignaturesByDocument(documentId: number): Promise<Signature[]> {
    return await db
      .select()
      .from(signatures)
      .where(eq(signatures.documentId, documentId))
      .orderBy(desc(signatures.signedAt));
  }

  // Approval workflow methods
  async createApprovalWorkflow(workflow: InsertApprovalWorkflow): Promise<ApprovalWorkflow> {
    const [result] = await db
      .insert(approvalWorkflows)
      .values(workflow)
      .returning();
    return result;
  }

  async getApprovalWorkflow(workflowId: number): Promise<ApprovalWorkflow | undefined> {
    const [result] = await db
      .select()
      .from(approvalWorkflows)
      .where(eq(approvalWorkflows.id, workflowId));
    return result;
  }

  async getApprovalWorkflowByDocument(documentId: number): Promise<ApprovalWorkflow | undefined> {
    const [result] = await db
      .select()
      .from(approvalWorkflows)
      .where(eq(approvalWorkflows.documentId, documentId));
    return result;
  }

  async updateApprovalWorkflow(workflowId: number, updates: Partial<InsertApprovalWorkflow>): Promise<void> {
    await db
      .update(approvalWorkflows)
      .set(updates)
      .where(eq(approvalWorkflows.id, workflowId));
  }

  async createApprovalStep(step: InsertApprovalStep): Promise<ApprovalStep> {
    const [result] = await db
      .insert(approvalSteps)
      .values(step)
      .returning();
    return result;
  }

  async getApprovalStep(stepId: number): Promise<ApprovalStep | undefined> {
    const [result] = await db
      .select()
      .from(approvalSteps)
      .where(eq(approvalSteps.id, stepId));
    return result;
  }

  async getApprovalStepsByWorkflow(workflowId: number): Promise<ApprovalStep[]> {
    return await db
      .select()
      .from(approvalSteps)
      .where(eq(approvalSteps.workflowId, workflowId))
      .orderBy(approvalSteps.stepNumber);
  }

  async updateApprovalStep(stepId: number, updates: Partial<InsertApprovalStep>): Promise<void> {
    await db
      .update(approvalSteps)
      .set(updates)
      .where(eq(approvalSteps.id, stepId));
  }

  // DID credential methods
  async createDIDCredential(credential: InsertDidCredential): Promise<DidCredential> {
    const [result] = await db
      .insert(didCredentials)
      .values(credential)
      .returning();
    return result;
  }

  async getDIDCredential(credentialId: string): Promise<DidCredential | undefined> {
    const [result] = await db
      .select()
      .from(didCredentials)
      .where(eq(didCredentials.credentialId, credentialId));
    return result;
  }

  async getDIDCredentialsByUser(userId: number): Promise<DidCredential[]> {
    return await db
      .select()
      .from(didCredentials)
      .where(eq(didCredentials.userId, userId))
      .orderBy(desc(didCredentials.createdAt));
  }

  async updateDIDCredential(credentialId: string, updates: Partial<InsertDidCredential>): Promise<void> {
    await db
      .update(didCredentials)
      .set(updates)
      .where(eq(didCredentials.credentialId, credentialId));
  }

  async createDIDVerification(verification: InsertDidVerification): Promise<DidVerification> {
    const [result] = await db
      .insert(didVerifications)
      .values(verification)
      .returning();
    return result;
  }

  async getDIDVerificationsByCredential(credentialId: string): Promise<DidVerification[]> {
    return await db
      .select()
      .from(didVerifications)
      .where(eq(didVerifications.credentialId, credentialId))
      .orderBy(desc(didVerifications.verifiedAt));
  }

  // Enterprise role methods
  async createEnterpriseRole(role: InsertEnterpriseRole): Promise<EnterpriseRole> {
    const [result] = await db
      .insert(enterpriseRoles)
      .values(role)
      .returning();
    return result;
  }

  async getEnterpriseRolesByOrg(organizationId: number): Promise<EnterpriseRole[]> {
    return await db
      .select()
      .from(enterpriseRoles)
      .where(eq(enterpriseRoles.organizationId, organizationId));
  }

  async assignUserRole(assignment: InsertUserRole): Promise<UserRole> {
    const [result] = await db
      .insert(userRoles)
      .values(assignment)
      .returning();
    return result;
  }

  async getUserRoles(userId: number): Promise<UserRole[]> {
    return await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
  }
}

export const storage = new DatabaseStorage();
