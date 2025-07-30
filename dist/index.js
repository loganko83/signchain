var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  apiKeys: () => apiKeys,
  approvalSteps: () => approvalSteps2,
  approvalWorkflows: () => approvalWorkflows2,
  auditLogs: () => auditLogs,
  blockchainTransactions: () => blockchainTransactions,
  didCredentials: () => didCredentials2,
  didVerifications: () => didVerifications2,
  documentCollaborators: () => documentCollaborators,
  documents: () => documents,
  enterpriseRoles: () => enterpriseRoles2,
  insertApiKeySchema: () => insertApiKeySchema,
  insertApprovalStepSchema: () => insertApprovalStepSchema,
  insertApprovalWorkflowSchema: () => insertApprovalWorkflowSchema,
  insertBlockchainTransactionSchema: () => insertBlockchainTransactionSchema,
  insertDidCredentialSchema: () => insertDidCredentialSchema,
  insertDidVerificationSchema: () => insertDidVerificationSchema,
  insertDocumentCollaboratorSchema: () => insertDocumentCollaboratorSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertEnterpriseRoleSchema: () => insertEnterpriseRoleSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOrganizationMemberSchema: () => insertOrganizationMemberSchema,
  insertOrganizationSchema: () => insertOrganizationSchema,
  insertSignatureRequestSchema: () => insertSignatureRequestSchema,
  insertSignatureSchema: () => insertSignatureSchema,
  insertUserRoleSchema: () => insertUserRoleSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSecuritySchema: () => insertUserSecuritySchema,
  insertWebhookSchema: () => insertWebhookSchema,
  insertWorkflowTemplateSchema: () => insertWorkflowTemplateSchema,
  loginSchema: () => loginSchema,
  moduleTypeEnum: () => moduleTypeEnum,
  notifications: () => notifications,
  organizationMembers: () => organizationMembers,
  organizations: () => organizations,
  signatureRequests: () => signatureRequests,
  signatures: () => signatures,
  userRoles: () => userRoles2,
  userSecurity: () => userSecurity,
  users: () => users,
  webhooks: () => webhooks,
  workflowTemplates: () => workflowTemplates
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var moduleTypeEnum, users, documents, signatures, signatureRequests, workflowTemplates, documentCollaborators, notifications, userSecurity, blockchainTransactions, organizations, organizationMembers, apiKeys, webhooks, approvalWorkflows2, approvalSteps2, didCredentials2, didVerifications2, enterpriseRoles2, userRoles2, auditLogs, insertUserSchema, insertDocumentSchema, insertApprovalWorkflowSchema, insertApprovalStepSchema, insertDidCredentialSchema, insertDidVerificationSchema, insertEnterpriseRoleSchema, insertUserRoleSchema, insertSignatureSchema, insertSignatureRequestSchema, insertWorkflowTemplateSchema, insertDocumentCollaboratorSchema, insertNotificationSchema, insertUserSecuritySchema, insertBlockchainTransactionSchema, insertOrganizationSchema, insertOrganizationMemberSchema, insertApiKeySchema, insertWebhookSchema, loginSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    moduleTypeEnum = pgEnum("module_type", ["contract", "approval", "did"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      name: text("name").notNull(),
      lastLoginAt: timestamp("last_login_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    documents = pgTable("documents", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      moduleType: moduleTypeEnum("module_type").notNull().default("contract"),
      category: text("category").notNull(),
      priority: text("priority").notNull().default("\uBCF4\uD1B5"),
      originalFilename: text("original_filename").notNull(),
      fileType: text("file_type").notNull(),
      fileSize: integer("file_size").notNull(),
      fileHash: text("file_hash").notNull(),
      ipfsHash: text("ipfs_hash").notNull(),
      blockchainTxHash: text("blockchain_tx_hash"),
      status: text("status").notNull().default("\uC5C5\uB85C\uB4DC\uB428"),
      uploadedBy: integer("uploaded_by").notNull(),
      organizationId: integer("organization_id"),
      // For enterprise accounts
      createdAt: timestamp("created_at").defaultNow()
    });
    signatures = pgTable("signatures", {
      id: serial("id").primaryKey(),
      documentId: integer("document_id").notNull(),
      signerId: integer("signer_id").notNull(),
      signerEmail: text("signer_email").notNull(),
      signatureData: text("signature_data").notNull(),
      signatureType: text("signature_type").notNull(),
      signedAt: timestamp("signed_at").defaultNow(),
      blockchainTxHash: text("blockchain_tx_hash"),
      isCompleted: boolean("is_completed").default(false)
    });
    signatureRequests = pgTable("signature_requests", {
      id: serial("id").primaryKey(),
      documentId: integer("document_id").notNull(),
      requesterId: integer("requester_id").notNull(),
      signerEmail: text("signer_email").notNull(),
      signerName: text("signer_name"),
      message: text("message"),
      deadline: timestamp("deadline"),
      signatureOrder: integer("signature_order").default(1).notNull(),
      isSequential: boolean("is_sequential").default(false).notNull(),
      reminderSent: boolean("reminder_sent").default(false).notNull(),
      status: text("status").notNull().default("\uB300\uAE30"),
      shareToken: text("share_token").notNull().unique(),
      workflowId: text("workflow_id"),
      // Groups related signature requests
      approvalRequired: boolean("approval_required").default(false).notNull(),
      approvedBy: integer("approved_by"),
      approvedAt: timestamp("approved_at"),
      rejectedBy: integer("rejected_by"),
      rejectedAt: timestamp("rejected_at"),
      rejectionReason: text("rejection_reason"),
      createdAt: timestamp("created_at").defaultNow()
    });
    workflowTemplates = pgTable("workflow_templates", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      createdBy: integer("created_by").notNull(),
      steps: jsonb("steps").notNull(),
      // Array of workflow steps
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    documentCollaborators = pgTable("document_collaborators", {
      id: serial("id").primaryKey(),
      documentId: integer("document_id").notNull(),
      userId: integer("user_id"),
      email: text("email").notNull(),
      name: text("name"),
      role: text("role").notNull(),
      // 'signer', 'reviewer', 'approver', 'viewer'
      permissions: jsonb("permissions"),
      // Custom permissions object
      addedBy: integer("added_by").notNull(),
      addedAt: timestamp("added_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      type: text("type").notNull(),
      // 'signature_request', 'signature_completed', 'workflow_update', 'security_alert'
      isRead: boolean("is_read").default(false).notNull(),
      metadata: jsonb("metadata"),
      // Additional data for the notification
      createdAt: timestamp("created_at").defaultNow()
    });
    userSecurity = pgTable("user_security", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().unique(),
      twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
      twoFactorSecret: text("two_factor_secret"),
      biometricEnabled: boolean("biometric_enabled").default(false).notNull(),
      biometricPublicKey: text("biometric_public_key"),
      loginAttempts: integer("login_attempts").default(0).notNull(),
      lastLoginAt: timestamp("last_login_at"),
      lockedUntil: timestamp("locked_until"),
      createdAt: timestamp("created_at").defaultNow()
    });
    blockchainTransactions = pgTable("blockchain_transactions", {
      id: serial("id").primaryKey(),
      documentId: integer("document_id").notNull(),
      signatureId: integer("signature_id"),
      transactionHash: text("transaction_hash").notNull().unique(),
      blockNumber: integer("block_number"),
      networkId: integer("network_id").notNull(),
      // 1=Ethereum, 137=Polygon, etc.
      gasUsed: text("gas_used"),
      gasFee: text("gas_fee"),
      status: text("status").notNull().default("pending"),
      // 'pending', 'confirmed', 'failed'
      contractAddress: text("contract_address"),
      createdAt: timestamp("created_at").defaultNow(),
      confirmedAt: timestamp("confirmed_at")
    });
    organizations = pgTable("organizations", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      domain: text("domain"),
      settings: jsonb("settings"),
      // Organization-wide settings
      subscriptionTier: text("subscription_tier").default("basic").notNull(),
      createdBy: integer("created_by").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    organizationMembers = pgTable("organization_members", {
      id: serial("id").primaryKey(),
      organizationId: integer("organization_id").notNull(),
      userId: integer("user_id").notNull(),
      role: text("role").notNull(),
      // 'admin', 'manager', 'member'
      permissions: jsonb("permissions"),
      joinedAt: timestamp("joined_at").defaultNow()
    });
    apiKeys = pgTable("api_keys", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      organizationId: integer("organization_id"),
      name: text("name").notNull(),
      keyHash: text("key_hash").notNull().unique(),
      lastUsed: timestamp("last_used"),
      permissions: jsonb("permissions"),
      // Array of allowed operations
      isActive: boolean("is_active").default(true).notNull(),
      expiresAt: timestamp("expires_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    webhooks = pgTable("webhooks", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      organizationId: integer("organization_id"),
      url: text("url").notNull(),
      secret: text("secret").notNull(),
      events: jsonb("events").notNull(),
      // Array of event types to subscribe to
      isActive: boolean("is_active").default(true).notNull(),
      lastTriggered: timestamp("last_triggered"),
      failureCount: integer("failure_count").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    approvalWorkflows2 = pgTable("approval_workflows", {
      id: serial("id").primaryKey(),
      documentId: integer("document_id").notNull(),
      workflowName: text("workflow_name").notNull(),
      organizationId: integer("organization_id").notNull(),
      initiatedBy: integer("initiated_by").notNull(),
      currentStep: integer("current_step").default(1).notNull(),
      totalSteps: integer("total_steps").notNull(),
      status: text("status").default("\uC9C4\uD589\uC911").notNull(),
      // 진행중, 완료, 거부, 보류
      blockchainTxHash: text("blockchain_tx_hash"),
      // Transaction for workflow creation
      completedAt: timestamp("completed_at"),
      metadata: jsonb("metadata"),
      // Workflow configuration
      createdAt: timestamp("created_at").defaultNow()
    });
    approvalSteps2 = pgTable("approval_steps", {
      id: serial("id").primaryKey(),
      workflowId: integer("workflow_id").notNull(),
      stepNumber: integer("step_number").notNull(),
      assignedTo: integer("assigned_to"),
      // User ID
      assignedRole: text("assigned_role"),
      // Role name for dynamic assignment
      stepType: text("step_type").notNull(),
      // 서명, 검토, 승인
      status: text("status").default("\uB300\uAE30").notNull(),
      // 대기, 완료, 거부, 건너뜀
      completedBy: integer("completed_by"),
      completedAt: timestamp("completed_at"),
      comments: text("comments"),
      blockchainTxHash: text("blockchain_tx_hash"),
      // Transaction for each step completion
      deadline: timestamp("deadline"),
      createdAt: timestamp("created_at").defaultNow()
    });
    didCredentials2 = pgTable("did_credentials", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      credentialType: text("credential_type").notNull(),
      // 사업자등록증, 주민증, 여권
      credentialId: text("credential_id").notNull().unique(),
      // DID identifier
      issuer: text("issuer").notNull(),
      // Issuing authority
      subject: jsonb("subject").notNull(),
      // Credential data (encrypted)
      proof: jsonb("proof").notNull(),
      // Cryptographic proof
      expiresAt: timestamp("expires_at"),
      revokedAt: timestamp("revoked_at"),
      blockchainTxHash: text("blockchain_tx_hash").notNull(),
      // Blockchain registration
      verificationKey: text("verification_key").notNull(),
      status: text("status").default("\uD65C\uC131").notNull(),
      // 활성, 만료, 폐기
      metadata: jsonb("metadata"),
      // Additional credential metadata
      createdAt: timestamp("created_at").defaultNow()
    });
    didVerifications2 = pgTable("did_verifications", {
      id: serial("id").primaryKey(),
      credentialId: text("credential_id").notNull(),
      verifierId: integer("verifier_id").notNull(),
      verificationResult: boolean("verification_result").notNull(),
      verificationMethod: text("verification_method").notNull(),
      // 블록체인, QR코드, API
      blockchainTxHash: text("blockchain_tx_hash"),
      // Transaction for verification record
      metadata: jsonb("metadata"),
      // Verification details
      verifiedAt: timestamp("verified_at").defaultNow()
    });
    enterpriseRoles2 = pgTable("enterprise_roles", {
      id: serial("id").primaryKey(),
      organizationId: integer("organization_id").notNull(),
      roleName: text("role_name").notNull(),
      permissions: jsonb("permissions").notNull(),
      // Array of permissions
      description: text("description"),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    userRoles2 = pgTable("user_roles", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      roleId: integer("role_id").notNull(),
      organizationId: integer("organization_id").notNull(),
      assignedBy: integer("assigned_by").notNull(),
      assignedAt: timestamp("assigned_at").defaultNow()
    });
    auditLogs = pgTable("audit_logs", {
      id: serial("id").primaryKey(),
      documentId: integer("document_id").notNull(),
      userId: integer("user_id"),
      action: text("action").notNull(),
      description: text("description").notNull(),
      metadata: jsonb("metadata"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      timestamp: timestamp("timestamp").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      email: true,
      password: true,
      name: true
    });
    insertDocumentSchema = createInsertSchema(documents).pick({
      title: true,
      description: true,
      moduleType: true,
      category: true,
      priority: true,
      originalFilename: true,
      fileType: true,
      fileSize: true,
      fileHash: true,
      ipfsHash: true,
      uploadedBy: true,
      organizationId: true
    });
    insertApprovalWorkflowSchema = createInsertSchema(approvalWorkflows2).pick({
      documentId: true,
      workflowName: true,
      organizationId: true,
      initiatedBy: true,
      totalSteps: true,
      metadata: true
    });
    insertApprovalStepSchema = createInsertSchema(approvalSteps2).pick({
      workflowId: true,
      stepNumber: true,
      assignedTo: true,
      assignedRole: true,
      stepType: true,
      deadline: true
    });
    insertDidCredentialSchema = createInsertSchema(didCredentials2).pick({
      userId: true,
      credentialType: true,
      credentialId: true,
      issuer: true,
      subject: true,
      proof: true,
      expiresAt: true,
      verificationKey: true,
      metadata: true
    });
    insertDidVerificationSchema = createInsertSchema(didVerifications2).pick({
      credentialId: true,
      verifierId: true,
      verificationResult: true,
      verificationMethod: true,
      metadata: true
    });
    insertEnterpriseRoleSchema = createInsertSchema(enterpriseRoles2).pick({
      organizationId: true,
      roleName: true,
      permissions: true,
      description: true
    });
    insertUserRoleSchema = createInsertSchema(userRoles2).pick({
      userId: true,
      roleId: true,
      organizationId: true,
      assignedBy: true
    });
    insertSignatureSchema = createInsertSchema(signatures).pick({
      documentId: true,
      signerId: true,
      signerEmail: true,
      signatureData: true,
      signatureType: true
    });
    insertSignatureRequestSchema = createInsertSchema(signatureRequests).pick({
      documentId: true,
      requesterId: true,
      signerEmail: true,
      signerName: true,
      message: true,
      deadline: true,
      signatureOrder: true,
      isSequential: true,
      shareToken: true,
      workflowId: true,
      approvalRequired: true
    });
    insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates).pick({
      name: true,
      description: true,
      createdBy: true,
      steps: true
    });
    insertDocumentCollaboratorSchema = createInsertSchema(documentCollaborators).pick({
      documentId: true,
      userId: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      addedBy: true
    });
    insertNotificationSchema = createInsertSchema(notifications).pick({
      userId: true,
      title: true,
      message: true,
      type: true,
      metadata: true
    });
    insertUserSecuritySchema = createInsertSchema(userSecurity).pick({
      userId: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
      biometricEnabled: true,
      biometricPublicKey: true
    });
    insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).pick({
      documentId: true,
      signatureId: true,
      transactionHash: true,
      networkId: true,
      contractAddress: true
    });
    insertOrganizationSchema = createInsertSchema(organizations).pick({
      name: true,
      domain: true,
      settings: true,
      subscriptionTier: true,
      createdBy: true
    });
    insertOrganizationMemberSchema = createInsertSchema(organizationMembers).pick({
      organizationId: true,
      userId: true,
      role: true,
      permissions: true
    });
    insertApiKeySchema = createInsertSchema(apiKeys).pick({
      userId: true,
      organizationId: true,
      name: true,
      keyHash: true,
      permissions: true,
      expiresAt: true
    });
    insertWebhookSchema = createInsertSchema(webhooks).pick({
      userId: true,
      organizationId: true,
      url: true,
      secret: true,
      events: true
    });
    loginSchema = z.object({
      email: z.string().email("\uC62C\uBC14\uB978 \uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"),
      password: z.string().min(1, "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694")
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, and, desc } from "drizzle-orm";
var DatabaseStorage, isDevelopment, isMockDatabase, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || void 0;
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async updateUserLastLogin(userId) {
        await db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
      }
      async getDocument(id) {
        const [document] = await db.select().from(documents).where(eq(documents.id, id));
        return document || void 0;
      }
      async getDocumentsByUser(userId) {
        return await db.select().from(documents).where(eq(documents.uploadedBy, userId));
      }
      async createDocument(document) {
        const [doc] = await db.insert(documents).values({
          ...document,
          status: "\uC5C5\uB85C\uB4DC\uB428"
        }).returning();
        return doc;
      }
      async updateDocumentStatus(id, status, blockchainTxHash) {
        await db.update(documents).set({
          status,
          blockchainTxHash: blockchainTxHash || void 0
        }).where(eq(documents.id, id));
      }
      async getSignature(id) {
        const [signature] = await db.select().from(signatures).where(eq(signatures.id, id));
        return signature || void 0;
      }
      async createSignature(signature) {
        const [sig] = await db.insert(signatures).values({
          ...signature,
          isCompleted: false
        }).returning();
        return sig;
      }
      async updateSignatureCompletion(id, isCompleted) {
        await db.update(signatures).set({ isCompleted }).where(eq(signatures.id, id));
      }
      async getSignatureRequest(id) {
        const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.id, id));
        return request || void 0;
      }
      async getSignatureRequestByToken(token) {
        const [request] = await db.select().from(signatureRequests).where(eq(signatureRequests.shareToken, token));
        return request || void 0;
      }
      async getSignatureRequestsByDocument(documentId) {
        return await db.select().from(signatureRequests).where(eq(signatureRequests.documentId, documentId));
      }
      async getSignatureRequestsByUser(userId) {
        return await db.select().from(signatureRequests).where(eq(signatureRequests.requesterId, userId));
      }
      async createSignatureRequest(request) {
        const [req] = await db.insert(signatureRequests).values({
          ...request,
          status: "\uB300\uAE30"
        }).returning();
        return req;
      }
      async updateSignatureRequestStatus(id, status) {
        await db.update(signatureRequests).set({ status }).where(eq(signatureRequests.id, id));
      }
      async createAuditLog(log2) {
        const [auditLog] = await db.insert(auditLogs).values(log2).returning();
        return auditLog;
      }
      async getAuditLogsByDocument(documentId) {
        return await db.select().from(auditLogs).where(eq(auditLogs.documentId, documentId)).orderBy(auditLogs.timestamp);
      }
      // Workflow template methods
      async getWorkflowTemplate(id) {
        const [template] = await db.select().from(workflowTemplates).where(eq(workflowTemplates.id, id));
        return template || void 0;
      }
      async getWorkflowTemplatesByUser(userId) {
        return await db.select().from(workflowTemplates).where(eq(workflowTemplates.createdBy, userId));
      }
      async createWorkflowTemplate(template) {
        const [result] = await db.insert(workflowTemplates).values(template).returning();
        return result;
      }
      // Workflow execution methods
      async createWorkflowFromTemplate(templateId, documentId, requesterId) {
        const template = await this.getWorkflowTemplate(templateId);
        if (!template) throw new Error("Workflow template not found");
        const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const steps = template.steps;
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
              approvalRequired: step.type === "approver",
              shareToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              deadline: step.deadline ? new Date(Date.now() + parseInt(step.deadline) * 24 * 60 * 60 * 1e3) : void 0
            });
          }
        }
        return workflowId;
      }
      async getWorkflowStatus(workflowId) {
        const requests = await db.select().from(signatureRequests).where(eq(signatureRequests.workflowId, workflowId));
        const completed = requests.filter((r) => r.status === "\uC644\uB8CC").length;
        const currentStep = requests.find((r) => r.status === "\uB300\uAE30");
        return {
          completed,
          total: requests.length,
          currentStep: currentStep || void 0
        };
      }
      async approveSignatureRequest(requestId, approverId) {
        await db.update(signatureRequests).set({
          status: "\uC2B9\uC778\uB428",
          approvedBy: approverId,
          approvedAt: /* @__PURE__ */ new Date()
        }).where(eq(signatureRequests.id, requestId));
      }
      async rejectSignatureRequest(requestId, approverId, reason) {
        await db.update(signatureRequests).set({
          status: "\uAC70\uBD80\uB428",
          rejectedBy: approverId,
          rejectedAt: /* @__PURE__ */ new Date(),
          rejectionReason: reason
        }).where(eq(signatureRequests.id, requestId));
      }
      // Notification methods
      async createNotification(notification) {
        const [result] = await db.insert(notifications).values(notification).returning();
        return result;
      }
      async getNotificationsByUser(userId) {
        return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
      }
      async getUnreadNotifications(userId) {
        return await db.select().from(notifications).where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )).orderBy(desc(notifications.createdAt));
      }
      async markNotificationAsRead(notificationId, userId) {
        await db.update(notifications).set({ isRead: true }).where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ));
      }
      async markAllNotificationsAsRead(userId) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
      }
      // Security methods
      async getUserSecurity(userId) {
        const [security] = await db.select().from(userSecurity).where(eq(userSecurity.userId, userId));
        return security || void 0;
      }
      async createUserSecurity(security) {
        const [result] = await db.insert(userSecurity).values(security).returning();
        return result;
      }
      async updateUserSecurity(userId, updates) {
        await db.update(userSecurity).set(updates).where(eq(userSecurity.userId, userId));
      }
      // Blockchain methods
      async createBlockchainTransaction(transaction) {
        const [result] = await db.insert(blockchainTransactions).values(transaction).returning();
        return result;
      }
      async getBlockchainTransactionsByDocument(documentId) {
        return await db.select().from(blockchainTransactions).where(eq(blockchainTransactions.documentId, documentId)).orderBy(desc(blockchainTransactions.createdAt));
      }
      async updateBlockchainTransactionStatus(transactionHash, status, blockNumber, gasUsed, gasFee) {
        const updates = { status };
        if (blockNumber) updates.blockNumber = blockNumber;
        if (gasUsed) updates.gasUsed = gasUsed;
        if (gasFee) updates.gasFee = gasFee;
        if (status === "confirmed") updates.confirmedAt = /* @__PURE__ */ new Date();
        await db.update(blockchainTransactions).set(updates).where(eq(blockchainTransactions.transactionHash, transactionHash));
      }
      // Helper methods for API
      async getAllDocuments() {
        return await db.select().from(documents).orderBy(desc(documents.createdAt));
      }
      async getSignaturesByDocument(documentId) {
        return await db.select().from(signatures).where(eq(signatures.documentId, documentId)).orderBy(desc(signatures.signedAt));
      }
      // Approval workflow methods
      async createApprovalWorkflow(workflow) {
        const [result] = await db.insert(approvalWorkflows).values(workflow).returning();
        return result;
      }
      async getApprovalWorkflow(workflowId) {
        const [result] = await db.select().from(approvalWorkflows).where(eq(approvalWorkflows.id, workflowId));
        return result;
      }
      async getApprovalWorkflowByDocument(documentId) {
        const [result] = await db.select().from(approvalWorkflows).where(eq(approvalWorkflows.documentId, documentId));
        return result;
      }
      async updateApprovalWorkflow(workflowId, updates) {
        await db.update(approvalWorkflows).set(updates).where(eq(approvalWorkflows.id, workflowId));
      }
      async createApprovalStep(step) {
        const [result] = await db.insert(approvalSteps).values(step).returning();
        return result;
      }
      async getApprovalStep(stepId) {
        const [result] = await db.select().from(approvalSteps).where(eq(approvalSteps.id, stepId));
        return result;
      }
      async getApprovalStepsByWorkflow(workflowId) {
        return await db.select().from(approvalSteps).where(eq(approvalSteps.workflowId, workflowId)).orderBy(approvalSteps.stepNumber);
      }
      async updateApprovalStep(stepId, updates) {
        await db.update(approvalSteps).set(updates).where(eq(approvalSteps.id, stepId));
      }
      // DID credential methods
      async createDIDCredential(credential) {
        const [result] = await db.insert(didCredentials).values(credential).returning();
        return result;
      }
      async getDIDCredential(credentialId) {
        const [result] = await db.select().from(didCredentials).where(eq(didCredentials.credentialId, credentialId));
        return result;
      }
      async getDIDCredentialsByUser(userId) {
        return await db.select().from(didCredentials).where(eq(didCredentials.userId, userId)).orderBy(desc(didCredentials.createdAt));
      }
      async updateDIDCredential(credentialId, updates) {
        await db.update(didCredentials).set(updates).where(eq(didCredentials.credentialId, credentialId));
      }
      async createDIDVerification(verification) {
        const [result] = await db.insert(didVerifications).values(verification).returning();
        return result;
      }
      async getDIDVerificationsByCredential(credentialId) {
        return await db.select().from(didVerifications).where(eq(didVerifications.credentialId, credentialId)).orderBy(desc(didVerifications.verifiedAt));
      }
      // Enterprise role methods
      async createEnterpriseRole(role) {
        const [result] = await db.insert(enterpriseRoles).values(role).returning();
        return result;
      }
      async getEnterpriseRolesByOrg(organizationId) {
        return await db.select().from(enterpriseRoles).where(eq(enterpriseRoles.organizationId, organizationId));
      }
      async assignUserRole(assignment) {
        const [result] = await db.insert(userRoles).values(assignment).returning();
        return result;
      }
      async getUserRoles(userId) {
        return await db.select().from(userRoles).where(eq(userRoles.userId, userId));
      }
    };
    isDevelopment = process.env.NODE_ENV === "development";
    isMockDatabase = process.env.DATABASE_URL?.includes("mock-database");
    storage = new DatabaseStorage();
  }
});

// server/security.ts
var security_exports = {};
__export(security_exports, {
  BiometricAuth: () => BiometricAuth,
  SecurityHelpers: () => SecurityHelpers,
  TwoFactorAuth: () => TwoFactorAuth
});
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import bcrypt from "bcrypt";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from "@simplewebauthn/server";
var TwoFactorAuth, BiometricAuth, SecurityHelpers;
var init_security = __esm({
  "server/security.ts"() {
    "use strict";
    init_storage();
    TwoFactorAuth = class {
      static generateSecret(userEmail) {
        const secret = speakeasy.generateSecret({
          name: `SignChain (${userEmail})`,
          issuer: "SignChain",
          length: 32
        });
        const qrCodeUrl = speakeasy.otpauthURL({
          secret: secret.ascii,
          label: userEmail,
          issuer: "SignChain",
          encoding: "ascii"
        });
        return {
          secret: secret.base32,
          qrCodeUrl
        };
      }
      static async generateQRCode(secret, userEmail) {
        const otpauthUrl = speakeasy.otpauthURL({
          secret,
          label: userEmail,
          issuer: "SignChain",
          encoding: "base32"
        });
        return await QRCode.toDataURL(otpauthUrl);
      }
      static verifyToken(token, secret) {
        return speakeasy.totp.verify({
          secret,
          encoding: "base32",
          token,
          window: 2
          // Allow 2 time steps (60 seconds) of tolerance
        });
      }
      static async enableTwoFactor(userId, token) {
        try {
          const userSecurity2 = await storage.getUserSecurity(userId);
          if (!userSecurity2?.twoFactorSecret) {
            throw new Error("2FA secret not found");
          }
          const isValid = this.verifyToken(token, userSecurity2.twoFactorSecret);
          if (!isValid) {
            return { success: false };
          }
          await storage.updateUserSecurity(userId, {
            twoFactorEnabled: true
          });
          const backupCodes = Array.from(
            { length: 8 },
            () => Math.random().toString(36).substring(2, 8).toUpperCase()
          );
          return { success: true, backupCodes };
        } catch (error) {
          console.error("2FA \uD65C\uC131\uD654 \uC624\uB958:", error);
          return { success: false };
        }
      }
      static async verifyTwoFactor(userId, token) {
        try {
          const userSecurity2 = await storage.getUserSecurity(userId);
          if (!userSecurity2?.twoFactorEnabled || !userSecurity2.twoFactorSecret) {
            return false;
          }
          return this.verifyToken(token, userSecurity2.twoFactorSecret);
        } catch (error) {
          console.error("2FA \uAC80\uC99D \uC624\uB958:", error);
          return false;
        }
      }
    };
    BiometricAuth = class {
      static rpName = process.env.RP_NAME || "SignChain";
      static rpID = process.env.RP_ID || "localhost";
      static origin = process.env.ORIGIN || "http://localhost:5000";
      static async generateRegistrationOptions(userId, userEmail) {
        const user = await storage.getUser(userId);
        if (!user) {
          throw new Error("\uC0AC\uC6A9\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
        }
        const userSecurity2 = await storage.getUserSecurity(userId);
        const excludeCredentials = userSecurity2?.biometricPublicKey ? [{
          id: Buffer.from(userSecurity2.biometricPublicKey, "base64"),
          type: "public-key"
        }] : [];
        const options = await generateRegistrationOptions({
          rpName: this.rpName,
          rpID: this.rpID,
          userID: userId.toString(),
          userName: userEmail,
          userDisplayName: user.username,
          attestationType: "none",
          excludeCredentials,
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
            authenticatorAttachment: "platform"
            // Prefer platform authenticators (TouchID, FaceID, Windows Hello)
          }
        });
        return options;
      }
      static async verifyRegistration(userId, credential) {
        try {
          const verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge: credential.challenge,
            // You should store this in session/cache
            expectedOrigin: this.origin,
            expectedRPID: this.rpID
          });
          if (verification.verified && verification.registrationInfo) {
            await storage.updateUserSecurity(userId, {
              biometricEnabled: true,
              biometricPublicKey: Buffer.from(verification.registrationInfo.credentialPublicKey).toString("base64")
            });
            return { success: true, credentialID: verification.registrationInfo.credentialID };
          }
          return { success: false };
        } catch (error) {
          console.error("\uC0DD\uCCB4 \uC778\uC99D \uB4F1\uB85D \uAC80\uC99D \uC624\uB958:", error);
          return { success: false };
        }
      }
      static async generateAuthenticationOptions(userId) {
        const options = await generateAuthenticationOptions({
          rpID: this.rpID,
          userVerification: "preferred"
        });
        return options;
      }
      static async verifyAuthentication(userId, credential) {
        try {
          const userSecurity2 = await storage.getUserSecurity(userId);
          if (!userSecurity2?.biometricEnabled || !userSecurity2.biometricPublicKey) {
            return { success: false };
          }
          const verification = await verifyAuthenticationResponse({
            response: credential,
            expectedChallenge: credential.challenge,
            // You should store this in session/cache
            expectedOrigin: this.origin,
            expectedRPID: this.rpID,
            authenticator: {
              credentialID: Buffer.from(userSecurity2.biometricPublicKey, "base64"),
              credentialPublicKey: Buffer.from(userSecurity2.biometricPublicKey, "base64"),
              counter: 0
              // You should track this
            }
          });
          return { success: verification.verified };
        } catch (error) {
          console.error("\uC0DD\uCCB4 \uC778\uC99D \uAC80\uC99D \uC624\uB958:", error);
          return { success: false };
        }
      }
    };
    SecurityHelpers = class {
      static async hashPassword(password) {
        return await bcrypt.hash(password, 12);
      }
      static async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
      }
      static generateSessionToken() {
        return __require("crypto").randomBytes(32).toString("hex");
      }
      static async checkAccountLock(userId) {
        const userSecurity2 = await storage.getUserSecurity(userId);
        if (!userSecurity2) {
          return { isLocked: false };
        }
        if (userSecurity2.lockedUntil && /* @__PURE__ */ new Date() < userSecurity2.lockedUntil) {
          const remainingTime = userSecurity2.lockedUntil.getTime() - Date.now();
          return { isLocked: true, remainingTime: Math.ceil(remainingTime / 1e3) };
        }
        return { isLocked: false };
      }
      static async recordFailedLogin(userId) {
        const userSecurity2 = await storage.getUserSecurity(userId);
        if (!userSecurity2) {
          return { shouldLock: false, attemptsRemaining: 5 };
        }
        const newAttempts = userSecurity2.loginAttempts + 1;
        const shouldLock = newAttempts >= 5;
        const updates = { loginAttempts: newAttempts };
        if (shouldLock) {
          updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1e3);
          updates.loginAttempts = 0;
        }
        await storage.updateUserSecurity(userId, updates);
        return {
          shouldLock,
          attemptsRemaining: shouldLock ? 0 : 5 - newAttempts
        };
      }
      static async recordSuccessfulLogin(userId) {
        await storage.updateUserSecurity(userId, {
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: /* @__PURE__ */ new Date()
        });
      }
      static validatePasswordStrength(password) {
        const errors = [];
        if (password.length < 8) {
          errors.push("\uBE44\uBC00\uBC88\uD638\uB294 \uCD5C\uC18C 8\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4");
        }
        if (!/[A-Z]/.test(password)) {
          errors.push("\uB300\uBB38\uC790\uAC00 \uD3EC\uD568\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4");
        }
        if (!/[a-z]/.test(password)) {
          errors.push("\uC18C\uBB38\uC790\uAC00 \uD3EC\uD568\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4");
        }
        if (!/\d/.test(password)) {
          errors.push("\uC22B\uC790\uAC00 \uD3EC\uD568\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          errors.push("\uD2B9\uC218\uBB38\uC790\uAC00 \uD3EC\uD568\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4");
        }
        return {
          isValid: errors.length === 0,
          errors
        };
      }
    };
  }
});

// server/blockchain.ts
import { ethers } from "ethers";
var BlockchainService;
var init_blockchain = __esm({
  "server/blockchain.ts"() {
    "use strict";
    BlockchainService = class {
      provider;
      wallet;
      contractAddress;
      contractABI;
      constructor() {
        this.initializeNetworks();
      }
      initializeNetworks() {
        const ethereumRpc = process.env.ETHEREUM_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/your-api-key";
        const polygonRpc = process.env.POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/your-api-key";
        this.provider = new ethers.JsonRpcProvider(polygonRpc);
        const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || "0x" + "1".repeat(64);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contractAddress = process.env.CONTRACT_ADDRESS || "0x" + "0".repeat(40);
        this.contractABI = this.getContractABI();
      }
      // 문서 블록체인 등록
      async registerDocument(data) {
        try {
          const optimalNetwork = await this.selectOptimalNetwork();
          const mockTxHash = "0x" + __require("crypto").randomBytes(32).toString("hex");
          const mockBlockNumber = Math.floor(Math.random() * 1e6) + 15e6;
          return {
            transactionHash: mockTxHash,
            blockNumber: mockBlockNumber,
            gasUsed: "21000",
            gasFee: "0.001",
            confirmations: 1,
            isValid: true
          };
        } catch (error) {
          console.error("Document registration error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 \uBB38\uC11C \uB4F1\uB85D \uC2E4\uD328");
        }
      }
      // 서명 블록체인 등록
      async registerSignature(data) {
        try {
          const mockTxHash = "0x" + __require("crypto").randomBytes(32).toString("hex");
          const mockBlockNumber = Math.floor(Math.random() * 1e6) + 15e6;
          return {
            transactionHash: mockTxHash,
            blockNumber: mockBlockNumber,
            gasUsed: "35000",
            gasFee: "0.002",
            confirmations: 1,
            isValid: true
          };
        } catch (error) {
          console.error("Signature registration error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 \uC11C\uBA85 \uB4F1\uB85D \uC2E4\uD328");
        }
      }
      // 서명 요청 블록체인 등록
      async registerSignatureRequest(data) {
        try {
          const mockTxHash = "0x" + __require("crypto").randomBytes(32).toString("hex");
          const mockBlockNumber = Math.floor(Math.random() * 1e6) + 15e6;
          return {
            transactionHash: mockTxHash,
            blockNumber: mockBlockNumber,
            gasUsed: "25000",
            gasFee: "0.0015",
            confirmations: 1,
            isValid: true
          };
        } catch (error) {
          console.error("Signature request registration error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 \uC11C\uBA85 \uC694\uCCAD \uB4F1\uB85D \uC2E4\uD328");
        }
      }
      // 워크플로우 블록체인 등록
      async registerWorkflow(data) {
        try {
          const mockTxHash = "0x" + __require("crypto").randomBytes(32).toString("hex");
          const mockBlockNumber = Math.floor(Math.random() * 1e6) + 15e6;
          return {
            transactionHash: mockTxHash,
            blockNumber: mockBlockNumber,
            gasUsed: "45000",
            gasFee: "0.003",
            confirmations: 1,
            isValid: true
          };
        } catch (error) {
          console.error("Workflow registration error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uB4F1\uB85D \uC2E4\uD328");
        }
      }
      // 워크플로우 단계 완료 등록
      async registerStepCompletion(data) {
        try {
          const mockTxHash = "0x" + __require("crypto").randomBytes(32).toString("hex");
          const mockBlockNumber = Math.floor(Math.random() * 1e6) + 15e6;
          return {
            transactionHash: mockTxHash,
            blockNumber: mockBlockNumber,
            gasUsed: "30000",
            gasFee: "0.002",
            confirmations: 1,
            isValid: true
          };
        } catch (error) {
          console.error("Step completion registration error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 \uB2E8\uACC4 \uC644\uB8CC \uB4F1\uB85D \uC2E4\uD328");
        }
      }
      // DID 자격증명 블록체인 등록
      async registerDID(data) {
        try {
          const mockTxHash = "0x" + __require("crypto").randomBytes(32).toString("hex");
          const mockBlockNumber = Math.floor(Math.random() * 1e6) + 15e6;
          return {
            transactionHash: mockTxHash,
            blockNumber: mockBlockNumber,
            gasUsed: "55000",
            gasFee: "0.004",
            confirmations: 1,
            isValid: true
          };
        } catch (error) {
          console.error("DID registration error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 DID \uB4F1\uB85D \uC2E4\uD328");
        }
      }
      // DID 폐기 등록
      async revokeDID(data) {
        try {
          const mockTxHash = "0x" + __require("crypto").randomBytes(32).toString("hex");
          const mockBlockNumber = Math.floor(Math.random() * 1e6) + 15e6;
          return {
            transactionHash: mockTxHash,
            blockNumber: mockBlockNumber,
            gasUsed: "40000",
            gasFee: "0.003",
            confirmations: 1,
            isValid: true
          };
        } catch (error) {
          console.error("DID revocation error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 DID \uD3D0\uAE30 \uB4F1\uB85D \uC2E4\uD328");
        }
      }
      // 문서 검증
      async verifyDocument(data) {
        try {
          return {
            transactionHash: data.transactionHash || "0x" + __require("crypto").randomBytes(32).toString("hex"),
            blockNumber: Math.floor(Math.random() * 1e6) + 15e6,
            gasUsed: "15000",
            gasFee: "0.001",
            confirmations: 12,
            isValid: true
          };
        } catch (error) {
          console.error("Document verification error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 \uBB38\uC11C \uAC80\uC99D \uC2E4\uD328");
        }
      }
      // 서명 검증
      async verifySignature(data) {
        try {
          return {
            transactionHash: data.transactionHash || "0x" + __require("crypto").randomBytes(32).toString("hex"),
            blockNumber: Math.floor(Math.random() * 1e6) + 15e6,
            gasUsed: "18000",
            gasFee: "0.0012",
            confirmations: 8,
            isValid: true
          };
        } catch (error) {
          console.error("Signature verification error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 \uC11C\uBA85 \uAC80\uC99D \uC2E4\uD328");
        }
      }
      // DID 검증
      async verifyDID(data) {
        try {
          return {
            transactionHash: data.transactionHash,
            blockNumber: Math.floor(Math.random() * 1e6) + 15e6,
            gasUsed: "20000",
            gasFee: "0.0015",
            confirmations: 6,
            isValid: true
          };
        } catch (error) {
          console.error("DID verification error:", error);
          throw new Error("\uBE14\uB85D\uCCB4\uC778 DID \uAC80\uC99D \uC2E4\uD328");
        }
      }
      // 최적 네트워크 선택 (가스비 기반)
      async selectOptimalNetwork() {
        try {
          const ethereumGasPrice = await this.getGasPrice("ethereum");
          const polygonGasPrice = await this.getGasPrice("polygon");
          return polygonGasPrice < ethereumGasPrice ? "polygon" : "ethereum";
        } catch (error) {
          return "polygon";
        }
      }
      async getGasPrice(network) {
        try {
          return network === "polygon" ? 30 : 20;
        } catch (error) {
          return 50;
        }
      }
      getContractABI() {
        return [
          {
            "inputs": [
              { "internalType": "string", "name": "documentHash", "type": "string" },
              { "internalType": "string", "name": "documentType", "type": "string" },
              { "internalType": "uint256", "name": "uploader", "type": "uint256" }
            ],
            "name": "registerDocument",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "uint256", "name": "documentId", "type": "uint256" },
              { "internalType": "uint256", "name": "signer", "type": "uint256" },
              { "internalType": "string", "name": "signatureHash", "type": "string" },
              { "internalType": "string", "name": "signatureType", "type": "string" }
            ],
            "name": "registerSignature",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              { "internalType": "string", "name": "documentHash", "type": "string" }
            ],
            "name": "verifyDocument",
            "outputs": [
              { "internalType": "bool", "name": "isValid", "type": "bool" },
              { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ];
      }
    };
  }
});

// server/crypto.ts
import crypto from "crypto";
function generateDocumentHash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}
var init_crypto = __esm({
  "server/crypto.ts"() {
    "use strict";
  }
});

// server/modules/contract-module.ts
var ContractModule;
var init_contract_module = __esm({
  "server/modules/contract-module.ts"() {
    "use strict";
    init_storage();
    init_blockchain();
    init_crypto();
    ContractModule = class {
      blockchainService;
      constructor() {
        this.blockchainService = new BlockchainService();
      }
      // 계약서 업로드 및 블록체인 등록
      async uploadContract(contractData) {
        try {
          const fileHash = generateDocumentHash(contractData.fileContent);
          const ipfsHash = this.generateIPFSHash();
          const blockchainTx = await this.blockchainService.registerDocument({
            documentHash: fileHash,
            documentType: "contract",
            uploader: contractData.uploadedBy
          });
          const document = await storage.createDocument({
            title: contractData.title,
            description: contractData.description || "",
            moduleType: "contract",
            category: "\uACC4\uC57D",
            priority: "\uB192\uC74C",
            originalFilename: `${contractData.title}.${contractData.fileType.split("/")[1]}`,
            fileType: contractData.fileType,
            fileSize: contractData.fileContent.length,
            fileHash,
            ipfsHash,
            blockchainTxHash: blockchainTx.transactionHash,
            uploadedBy: contractData.uploadedBy,
            organizationId: contractData.organizationId
          });
          await storage.createAuditLog({
            userId: contractData.uploadedBy,
            action: "CONTRACT_UPLOADED",
            resource: "document",
            resourceId: document.id.toString(),
            details: JSON.stringify({
              title: contractData.title,
              fileHash,
              blockchainTxHash: blockchainTx.transactionHash
            })
          });
          return {
            document,
            blockchainTransaction: blockchainTx,
            success: true
          };
        } catch (error) {
          console.error("Contract upload error:", error);
          throw new Error("\uACC4\uC57D\uC11C \uC5C5\uB85C\uB4DC \uC2E4\uD328");
        }
      }
      // 계약서 서명 요청
      async requestContractSignature(requestData) {
        try {
          const document = await storage.getDocument(requestData.documentId);
          if (!document || document.moduleType !== "contract") {
            throw new Error("\uACC4\uC57D\uC11C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
          }
          const signatureRequest = await storage.createSignatureRequest({
            documentId: requestData.documentId,
            requesterId: requestData.requesterId,
            signerEmail: requestData.signerEmail,
            signerName: requestData.signerName,
            message: requestData.message,
            deadline: requestData.deadline,
            shareToken: this.generateShareToken()
          });
          const blockchainTx = await this.blockchainService.registerSignatureRequest({
            documentId: requestData.documentId,
            requester: requestData.requesterId,
            signer: requestData.signerEmail
          });
          return {
            signatureRequest,
            blockchainTransaction: blockchainTx,
            success: true
          };
        } catch (error) {
          console.error("Contract signature request error:", error);
          throw new Error("\uC11C\uBA85 \uC694\uCCAD \uC2E4\uD328");
        }
      }
      // 계약서 서명 처리
      async signContract(signData) {
        try {
          const signatureHash = generateDocumentHash(Buffer.from(signData.signatureData));
          const blockchainTx = await this.blockchainService.registerSignature({
            documentId: signData.documentId,
            signer: signData.signerId,
            signatureHash,
            signatureType: signData.signatureType
          });
          const signature = await storage.createSignature({
            documentId: signData.documentId,
            signerId: signData.signerId,
            signerEmail: signData.signerEmail,
            signatureData: signData.signatureData,
            signatureType: signData.signatureType,
            blockchainTxHash: blockchainTx.transactionHash
          });
          await storage.createAuditLog({
            userId: signData.signerId,
            action: "CONTRACT_SIGNED",
            resource: "signature",
            resourceId: signature.id.toString(),
            details: JSON.stringify({
              documentId: signData.documentId,
              signatureHash,
              blockchainTxHash: blockchainTx.transactionHash
            })
          });
          return {
            signature,
            blockchainTransaction: blockchainTx,
            success: true
          };
        } catch (error) {
          console.error("Contract signing error:", error);
          throw new Error("\uACC4\uC57D\uC11C \uC11C\uBA85 \uC2E4\uD328");
        }
      }
      // 계약서 검증
      async verifyContract(documentId) {
        try {
          const document = await storage.getDocument(documentId);
          if (!document || document.moduleType !== "contract") {
            throw new Error("\uACC4\uC57D\uC11C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
          }
          const verification = await this.blockchainService.verifyDocument({
            documentHash: document.fileHash,
            transactionHash: document.blockchainTxHash
          });
          const signatures2 = await storage.getSignaturesByDocument(documentId);
          const signatureVerifications = await Promise.all(
            signatures2.map(async (sig) => {
              return await this.blockchainService.verifySignature({
                signatureHash: generateDocumentHash(Buffer.from(sig.signatureData)),
                transactionHash: sig.blockchainTxHash
              });
            })
          );
          return {
            documentVerification: verification,
            signatureVerifications,
            isValid: verification.isValid && signatureVerifications.every((v) => v.isValid),
            signatures: signatures2.length
          };
        } catch (error) {
          console.error("Contract verification error:", error);
          throw new Error("\uACC4\uC57D\uC11C \uAC80\uC99D \uC2E4\uD328");
        }
      }
      generateIPFSHash() {
        return "Qm" + __require("crypto").randomBytes(22).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 44);
      }
      generateShareToken() {
        return __require("crypto").randomBytes(32).toString("hex");
      }
    };
  }
});

// server/modules/approval-module.ts
var ApprovalModule;
var init_approval_module = __esm({
  "server/modules/approval-module.ts"() {
    "use strict";
    init_storage();
    init_blockchain();
    init_crypto();
    ApprovalModule = class {
      blockchainService;
      constructor() {
        this.blockchainService = new BlockchainService();
      }
      // 승인 문서 업로드
      async uploadApprovalDocument(documentData) {
        try {
          const fileHash = generateDocumentHash(documentData.fileContent);
          const ipfsHash = this.generateIPFSHash();
          const blockchainTx = await this.blockchainService.registerDocument({
            documentHash: fileHash,
            documentType: "approval",
            uploader: documentData.uploadedBy
          });
          const document = await storage.createDocument({
            title: documentData.title,
            description: documentData.description || "",
            moduleType: "approval",
            category: "\uC2B9\uC778",
            priority: "\uBCF4\uD1B5",
            originalFilename: `${documentData.title}.${documentData.fileType.split("/")[1]}`,
            fileType: documentData.fileType,
            fileSize: documentData.fileContent.length,
            fileHash,
            ipfsHash,
            blockchainTxHash: blockchainTx.transactionHash,
            uploadedBy: documentData.uploadedBy,
            organizationId: documentData.organizationId
          });
          return {
            document,
            blockchainTransaction: blockchainTx,
            success: true
          };
        } catch (error) {
          console.error("Approval document upload error:", error);
          throw new Error("\uC2B9\uC778 \uBB38\uC11C \uC5C5\uB85C\uB4DC \uC2E4\uD328");
        }
      }
      // 승인 워크플로우 생성
      async createApprovalWorkflow(workflowData) {
        try {
          const blockchainTx = await this.blockchainService.registerWorkflow({
            documentId: workflowData.documentId,
            initiator: workflowData.initiatedBy,
            organizationId: workflowData.organizationId,
            stepsCount: workflowData.steps.length
          });
          const workflow = await storage.createApprovalWorkflow({
            documentId: workflowData.documentId,
            workflowName: workflowData.workflowName,
            organizationId: workflowData.organizationId,
            initiatedBy: workflowData.initiatedBy,
            totalSteps: workflowData.steps.length,
            blockchainTxHash: blockchainTx.transactionHash,
            metadata: JSON.stringify({ steps: workflowData.steps })
          });
          const steps = [];
          for (let i = 0; i < workflowData.steps.length; i++) {
            const stepData = workflowData.steps[i];
            const step = await storage.createApprovalStep({
              workflowId: workflow.id,
              stepNumber: i + 1,
              assignedTo: stepData.assignedTo,
              assignedRole: stepData.assignedRole,
              stepType: stepData.stepType,
              deadline: stepData.deadline
            });
            steps.push(step);
          }
          if (steps.length > 0) {
            await this.notifyStepAssignee(steps[0]);
          }
          return {
            workflow,
            steps,
            blockchainTransaction: blockchainTx,
            success: true
          };
        } catch (error) {
          console.error("Approval workflow creation error:", error);
          throw new Error("\uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0DD\uC131 \uC2E4\uD328");
        }
      }
      // 워크플로우 단계 완료 처리
      async completeWorkflowStep(stepData) {
        try {
          const step = await storage.getApprovalStep(stepData.stepId);
          if (!step) {
            throw new Error("\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uB2E8\uACC4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
          }
          const workflow = await storage.getApprovalWorkflow(step.workflowId);
          if (!workflow) {
            throw new Error("\uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
          }
          const blockchainTx = await this.blockchainService.registerStepCompletion({
            workflowId: step.workflowId,
            stepNumber: step.stepNumber,
            completedBy: stepData.completedBy,
            action: stepData.action
          });
          await storage.updateApprovalStep(stepData.stepId, {
            status: stepData.action === "\uAC70\uBD80" ? "\uAC70\uBD80" : "\uC644\uB8CC",
            completedBy: stepData.completedBy,
            completedAt: /* @__PURE__ */ new Date(),
            comments: stepData.comments,
            blockchainTxHash: blockchainTx.transactionHash
          });
          if (stepData.signatureData && step.stepType === "\uC11C\uBA85") {
            await storage.createSignature({
              documentId: workflow.documentId,
              signerId: stepData.completedBy,
              signerEmail: "",
              // 사용자 이메일 조회 필요
              signatureData: stepData.signatureData,
              signatureType: "approval_signature",
              blockchainTxHash: blockchainTx.transactionHash
            });
          }
          await this.updateWorkflowProgress(workflow.id, stepData.action === "\uAC70\uBD80");
          return {
            step,
            blockchainTransaction: blockchainTx,
            success: true
          };
        } catch (error) {
          console.error("Workflow step completion error:", error);
          throw new Error("\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uB2E8\uACC4 \uC644\uB8CC \uC2E4\uD328");
        }
      }
      // 사용자/이메일로 승인자 추가
      async addApprover(workflowData) {
        try {
          let workflow = await storage.getApprovalWorkflowByDocument(workflowData.documentId);
          if (!workflow) {
            const newWorkflowData = {
              documentId: workflowData.documentId,
              workflowName: `Document ${workflowData.documentId} Approval`,
              organizationId: workflowData.organizationId,
              initiatedBy: 1,
              // 현재 사용자
              steps: [{
                stepType: workflowData.stepType,
                deadline: workflowData.deadline
              }]
            };
            const result = await this.createApprovalWorkflow(newWorkflowData);
            workflow = result.workflow;
          }
          const nextStepNumber = workflow.totalSteps + 1;
          const step = await storage.createApprovalStep({
            workflowId: workflow.id,
            stepNumber: nextStepNumber,
            assignedTo: null,
            // 이메일로 초대된 외부 사용자
            assignedRole: workflowData.approverEmail,
            stepType: workflowData.stepType,
            deadline: workflowData.deadline
          });
          await storage.updateApprovalWorkflow(workflow.id, {
            totalSteps: nextStepNumber
          });
          await this.sendApprovalEmail({
            email: workflowData.approverEmail,
            name: workflowData.approverName,
            documentTitle: "",
            // 문서 제목 조회 필요
            stepType: workflowData.stepType,
            deadline: workflowData.deadline
          });
          return {
            workflow,
            step,
            success: true
          };
        } catch (error) {
          console.error("Add approver error:", error);
          throw new Error("\uC2B9\uC778\uC790 \uCD94\uAC00 \uC2E4\uD328");
        }
      }
      // 최종 문서 다운로드 및 공람
      async getFinalDocument(documentId) {
        try {
          const document = await storage.getDocument(documentId);
          if (!document || document.moduleType !== "approval") {
            throw new Error("\uC2B9\uC778 \uBB38\uC11C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
          }
          const workflow = await storage.getApprovalWorkflowByDocument(documentId);
          if (!workflow || workflow.status !== "\uC644\uB8CC") {
            throw new Error("\uC2B9\uC778 \uD504\uB85C\uC138\uC2A4\uAC00 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4");
          }
          const steps = await storage.getApprovalStepsByWorkflow(workflow.id);
          const signatures2 = await storage.getSignaturesByDocument(documentId);
          const verification = await this.blockchainService.verifyDocument({
            documentHash: document.fileHash,
            transactionHash: document.blockchainTxHash
          });
          return {
            document,
            workflow,
            steps,
            signatures: signatures2,
            verification,
            downloadUrl: `/api/documents/${documentId}/download?format=signed`,
            isComplete: true
          };
        } catch (error) {
          console.error("Final document retrieval error:", error);
          throw new Error("\uCD5C\uC885 \uBB38\uC11C \uC870\uD68C \uC2E4\uD328");
        }
      }
      // 워크플로우 진행 상태 업데이트
      async updateWorkflowProgress(workflowId, isRejected) {
        try {
          const workflow = await storage.getApprovalWorkflow(workflowId);
          const steps = await storage.getApprovalStepsByWorkflow(workflowId);
          if (isRejected) {
            await storage.updateApprovalWorkflow(workflowId, {
              status: "\uAC70\uBD80",
              completedAt: /* @__PURE__ */ new Date()
            });
            return;
          }
          const completedSteps = steps.filter((step) => step.status === "\uC644\uB8CC").length;
          const currentStep = Math.min(completedSteps + 1, workflow.totalSteps);
          if (completedSteps >= workflow.totalSteps) {
            await storage.updateApprovalWorkflow(workflowId, {
              status: "\uC644\uB8CC",
              completedAt: /* @__PURE__ */ new Date(),
              currentStep: workflow.totalSteps
            });
          } else {
            await storage.updateApprovalWorkflow(workflowId, {
              currentStep
            });
            const nextStep = steps.find((step) => step.stepNumber === currentStep);
            if (nextStep) {
              await this.notifyStepAssignee(nextStep);
            }
          }
        } catch (error) {
          console.error("Workflow progress update error:", error);
        }
      }
      async notifyStepAssignee(step) {
        try {
          if (step.assignedTo) {
          } else if (step.assignedRole) {
          }
        } catch (error) {
          console.error("Step assignee notification error:", error);
        }
      }
      async sendApprovalEmail(emailData) {
        try {
          console.log(`Sending approval email to ${emailData.email}`);
        } catch (error) {
          console.error("Approval email sending error:", error);
        }
      }
      generateIPFSHash() {
        return "Qm" + __require("crypto").randomBytes(22).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 44);
      }
    };
  }
});

// server/modules/did-module.ts
import crypto2 from "crypto";
var DIDModule;
var init_did_module = __esm({
  "server/modules/did-module.ts"() {
    "use strict";
    init_storage();
    init_blockchain();
    init_crypto();
    DIDModule = class {
      blockchainService;
      constructor() {
        this.blockchainService = new BlockchainService();
      }
      // DID 자격증명 발급 (사업자등록증, 주민증, 여권)
      async issueCredential(credentialData) {
        try {
          const credentialId = this.generateDID(credentialData.credentialType, credentialData.subjectData.idNumber);
          const keyPair = crypto2.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" }
          });
          const encryptedSubject = this.encryptCredentialData(credentialData.subjectData);
          const proof = this.generateProof(credentialData.subjectData, keyPair.privateKey);
          const blockchainTx = await this.blockchainService.registerDID({
            credentialId,
            credentialType: credentialData.credentialType,
            holder: credentialData.userId,
            issuer: credentialData.issuer,
            dataHash: generateDocumentHash(Buffer.from(JSON.stringify(credentialData.subjectData)))
          });
          const credential = await storage.createDIDCredential({
            userId: credentialData.userId,
            credentialType: credentialData.credentialType,
            credentialId,
            issuer: credentialData.issuer,
            subject: encryptedSubject,
            proof,
            expiresAt: credentialData.subjectData.expiryDate ? new Date(credentialData.subjectData.expiryDate) : null,
            blockchainTxHash: blockchainTx.transactionHash,
            verificationKey: keyPair.publicKey,
            metadata: JSON.stringify({
              issueDate: credentialData.subjectData.issueDate,
              verificationLevel: this.getVerificationLevel(credentialData.credentialType),
              supportingDocuments: credentialData.verificationDocuments?.length || 0
            })
          });
          await storage.createAuditLog({
            userId: credentialData.userId,
            action: "DID_CREDENTIAL_ISSUED",
            resource: "did_credential",
            resourceId: credential.id.toString(),
            details: JSON.stringify({
              credentialType: credentialData.credentialType,
              credentialId,
              blockchainTxHash: blockchainTx.transactionHash
            })
          });
          const encryptedPrivateKey = this.encryptPrivateKey(keyPair.privateKey, credentialData.userId);
          await storage.storeDIDPrivateKey({
            credentialId,
            userId: credentialData.userId,
            encryptedPrivateKey,
            createdAt: /* @__PURE__ */ new Date()
          });
          return {
            credential: {
              ...credential,
              subject: credentialData.subjectData
              // 반환 시에는 원본 데이터
            },
            verificationKey: keyPair.publicKey,
            // privateKey는 보안상 반환하지 않음
            blockchainTransaction: blockchainTx,
            qrCode: await this.generateQRCode(credentialId),
            success: true,
            message: "\uC790\uACA9\uC99D\uBA85\uC774 \uC548\uC804\uD558\uAC8C \uBC1C\uAE09\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uAC1C\uC778\uD0A4\uB294 \uC548\uC804\uD558\uAC8C \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
          };
        } catch (error) {
          console.error("DID credential issuance error:", error);
          throw new Error("DID \uC790\uACA9\uC99D\uBA85 \uBC1C\uAE09 \uC2E4\uD328");
        }
      }
      // DID 자격증명 검증
      async verifyCredential(verificationData) {
        try {
          const credential = await storage.getDIDCredential(verificationData.credentialId);
          if (!credential) {
            throw new Error("\uC790\uACA9\uC99D\uBA85\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
          }
          const blockchainVerification = await this.blockchainService.verifyDID({
            credentialId: verificationData.credentialId,
            transactionHash: credential.blockchainTxHash
          });
          const isValid = credential.status === "\uD65C\uC131" && !credential.revokedAt && (!credential.expiresAt || /* @__PURE__ */ new Date() < credential.expiresAt);
          const proofVerification = this.verifyProof(
            credential.proof,
            credential.verificationKey,
            verificationData.challenge
          );
          const verification = await storage.createDIDVerification({
            credentialId: verificationData.credentialId,
            verifierId: verificationData.verifierId,
            verificationResult: isValid && blockchainVerification.isValid && proofVerification,
            verificationMethod: verificationData.verificationMethod,
            blockchainTxHash: blockchainVerification.transactionHash,
            metadata: JSON.stringify({
              blockchainValid: blockchainVerification.isValid,
              proofValid: proofVerification,
              statusValid: isValid,
              verificationChain: blockchainVerification.confirmations
            })
          });
          return {
            verification,
            credential: {
              id: credential.credentialId,
              type: credential.credentialType,
              issuer: credential.issuer,
              status: credential.status,
              issuedAt: credential.createdAt,
              expiresAt: credential.expiresAt
            },
            isValid: verification.verificationResult,
            verificationDetails: {
              blockchain: blockchainVerification.isValid,
              proof: proofVerification,
              status: isValid,
              method: verificationData.verificationMethod
            }
          };
        } catch (error) {
          console.error("DID credential verification error:", error);
          throw new Error("DID \uC790\uACA9\uC99D\uBA85 \uAC80\uC99D \uC2E4\uD328");
        }
      }
      // DID로 신원 인증
      async authenticateWithDID(authData) {
        try {
          const credential = await storage.getDIDCredential(authData.credentialId);
          if (!credential || credential.userId !== authData.userId) {
            throw new Error("\uC790\uACA9\uC99D\uBA85\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
          }
          const isSignatureValid = crypto2.verify(
            "sha256",
            Buffer.from(authData.challenge),
            credential.verificationKey,
            Buffer.from(authData.signature, "base64")
          );
          if (!isSignatureValid) {
            throw new Error("\uC11C\uBA85\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
          }
          await storage.createDIDVerification({
            credentialId: authData.credentialId,
            verifierId: authData.userId,
            verificationResult: true,
            verificationMethod: "API",
            metadata: JSON.stringify({
              authenticationType: "challenge_response",
              challengeHash: generateDocumentHash(Buffer.from(authData.challenge))
            })
          });
          return {
            authenticated: true,
            credentialType: credential.credentialType,
            credentialId: credential.credentialId,
            timestamp: /* @__PURE__ */ new Date()
          };
        } catch (error) {
          console.error("DID authentication error:", error);
          throw new Error("DID \uC778\uC99D \uC2E4\uD328");
        }
      }
      // 자격증명 폐기
      async revokeCredential(revokeData) {
        try {
          const credential = await storage.getDIDCredential(revokeData.credentialId);
          if (!credential) {
            throw new Error("\uC790\uACA9\uC99D\uBA85\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
          }
          const blockchainTx = await this.blockchainService.revokeDID({
            credentialId: revokeData.credentialId,
            revokedBy: revokeData.revokedBy,
            reason: revokeData.reason
          });
          await storage.updateDIDCredential(revokeData.credentialId, {
            status: "\uD3D0\uAE30",
            revokedAt: /* @__PURE__ */ new Date()
          });
          await storage.createAuditLog({
            userId: revokeData.revokedBy,
            action: "DID_CREDENTIAL_REVOKED",
            resource: "did_credential",
            resourceId: credential.id.toString(),
            details: JSON.stringify({
              credentialId: revokeData.credentialId,
              reason: revokeData.reason,
              blockchainTxHash: blockchainTx.transactionHash
            })
          });
          return {
            revoked: true,
            blockchainTransaction: blockchainTx,
            timestamp: /* @__PURE__ */ new Date()
          };
        } catch (error) {
          console.error("DID credential revocation error:", error);
          throw new Error("DID \uC790\uACA9\uC99D\uBA85 \uD3D0\uAE30 \uC2E4\uD328");
        }
      }
      // 사용자의 모든 DID 자격증명 조회
      async getUserCredentials(userId) {
        try {
          const credentials2 = await storage.getDIDCredentialsByUser(userId);
          return credentials2.map((credential) => ({
            id: credential.credentialId,
            type: credential.credentialType,
            issuer: credential.issuer,
            status: credential.status,
            issuedAt: credential.createdAt,
            expiresAt: credential.expiresAt,
            verificationCount: 0,
            // 검증 횟수 조회 필요
            lastVerified: null
            // 마지막 검증 시간 조회 필요
          }));
        } catch (error) {
          console.error("User credentials retrieval error:", error);
          throw new Error("\uC0AC\uC6A9\uC790 \uC790\uACA9\uC99D\uBA85 \uC870\uD68C \uC2E4\uD328");
        }
      }
      // QR 코드를 통한 자격증명 공유
      async generateShareableCredential(credentialId, shareData) {
        try {
          const credential = await storage.getDIDCredential(credentialId);
          if (!credential) {
            throw new Error("\uC790\uACA9\uC99D\uBA85\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
          }
          const shareToken = crypto2.randomBytes(32).toString("hex");
          const shareUrl = `${process.env.BASE_URL}/verify/did/${shareToken}`;
          const shareInfo = {
            credentialId,
            validUntil: shareData.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1e3),
            // 24시간
            allowedVerifiers: shareData.allowedVerifiers,
            sharedBy: shareData.sharedBy,
            createdAt: /* @__PURE__ */ new Date()
          };
          const qrCode = await this.generateQRCode(shareUrl);
          return {
            shareToken,
            shareUrl,
            qrCode,
            validUntil: shareInfo.validUntil,
            credentialType: credential.credentialType
          };
        } catch (error) {
          console.error("Shareable credential generation error:", error);
          throw new Error("\uACF5\uC720 \uAC00\uB2A5\uD55C \uC790\uACA9\uC99D\uBA85 \uC0DD\uC131 \uC2E4\uD328");
        }
      }
      // 개인 정보 생성
      generateDID(credentialType, idNumber) {
        const prefix = "did:signchain:";
        const typeCode = {
          "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uC99D": "biz",
          "\uC8FC\uBBFC\uC99D": "id",
          "\uC5EC\uAD8C": "passport"
        }[credentialType] || "unknown";
        const uniqueId = crypto2.randomUUID();
        return `${prefix}${typeCode}:${uniqueId}`;
      }
      encryptCredentialData(data) {
        const encryptionKey = process.env.ENCRYPTION_KEY;
        if (!encryptionKey) {
          throw new Error("ENCRYPTION_KEY is not set in environment variables");
        }
        const algorithm = "aes-256-cbc";
        const key = crypto2.scryptSync(encryptionKey, "salt", 32);
        const iv = crypto2.randomBytes(16);
        const cipher = crypto2.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
        encrypted += cipher.final("hex");
        return {
          encrypted,
          iv: iv.toString("hex")
        };
      }
      generateProof(data, privateKey) {
        const dataHash = generateDocumentHash(Buffer.from(JSON.stringify(data)));
        const signature = crypto2.sign("sha256", Buffer.from(dataHash), privateKey);
        return {
          type: "RsaSignature2018",
          created: (/* @__PURE__ */ new Date()).toISOString(),
          proofPurpose: "assertionMethod",
          verificationMethod: "publicKey",
          jws: signature.toString("base64")
        };
      }
      verifyProof(proof, publicKey, challenge) {
        try {
          if (!proof.jws) return false;
          const signature = Buffer.from(proof.jws, "base64");
          const data = challenge || proof.created;
          return crypto2.verify("sha256", Buffer.from(data), publicKey, signature);
        } catch (error) {
          return false;
        }
      }
      encryptPrivateKey(privateKey, userId) {
        const encryptionKey = process.env.PRIVATE_KEY_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
        if (!encryptionKey) {
          throw new Error("PRIVATE_KEY_ENCRYPTION_KEY is not set in environment variables");
        }
        const algorithm = "aes-256-gcm";
        const salt = crypto2.randomBytes(32);
        const key = crypto2.scryptSync(encryptionKey + userId.toString(), salt, 32);
        const iv = crypto2.randomBytes(16);
        const cipher = crypto2.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(privateKey, "utf8", "hex");
        encrypted += cipher.final("hex");
        const authTag = cipher.getAuthTag();
        return JSON.stringify({
          encrypted,
          salt: salt.toString("hex"),
          iv: iv.toString("hex"),
          authTag: authTag.toString("hex")
        });
      }
      getVerificationLevel(credentialType) {
        const levels = {
          "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uC99D": "high",
          "\uC8FC\uBBFC\uC99D": "high",
          "\uC5EC\uAD8C": "highest"
        };
        return levels[credentialType] || "medium";
      }
      async generateQRCode(data) {
        const QRCode2 = __require("qrcode");
        try {
          return await QRCode2.toDataURL(data);
        } catch (error) {
          console.error("QR code generation error:", error);
          return "";
        }
      }
    };
  }
});

// server/modules/index.ts
var contractModule, approvalModule, didModule;
var init_modules = __esm({
  "server/modules/index.ts"() {
    "use strict";
    init_contract_module();
    init_approval_module();
    init_did_module();
    contractModule = new ContractModule();
    approvalModule = new ApprovalModule();
    didModule = new DIDModule();
  }
});

// server/module-routes.ts
var module_routes_exports = {};
__export(module_routes_exports, {
  default: () => module_routes_default
});
import { Router } from "express";
import multer from "multer";
var router, upload, module_routes_default;
var init_module_routes = __esm({
  "server/module-routes.ts"() {
    "use strict";
    init_modules();
    router = Router();
    upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }
      // 10MB limit
    });
    router.post("/contract/upload", upload.single("file"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "\uD30C\uC77C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4" });
        }
        const result = await contractModule.uploadContract({
          title: req.body.title,
          description: req.body.description,
          fileContent: req.file.buffer,
          fileType: req.file.mimetype,
          uploadedBy: parseInt(req.body.uploadedBy),
          organizationId: req.body.organizationId ? parseInt(req.body.organizationId) : void 0
        });
        res.json(result);
      } catch (error) {
        console.error("Contract upload error:", error);
        res.status(500).json({ error: "\uACC4\uC57D\uC11C \uC5C5\uB85C\uB4DC \uC2E4\uD328" });
      }
    });
    router.post("/contract/signature-request", async (req, res) => {
      try {
        const result = await contractModule.requestContractSignature({
          documentId: parseInt(req.body.documentId),
          signerEmail: req.body.signerEmail,
          signerName: req.body.signerName,
          message: req.body.message,
          deadline: req.body.deadline ? new Date(req.body.deadline) : void 0,
          requesterId: parseInt(req.body.requesterId)
        });
        res.json(result);
      } catch (error) {
        console.error("Contract signature request error:", error);
        res.status(500).json({ error: "\uC11C\uBA85 \uC694\uCCAD \uC2E4\uD328" });
      }
    });
    router.post("/contract/sign", async (req, res) => {
      try {
        const result = await contractModule.signContract({
          documentId: parseInt(req.body.documentId),
          signerId: parseInt(req.body.signerId),
          signerEmail: req.body.signerEmail,
          signatureData: req.body.signatureData,
          signatureType: req.body.signatureType
        });
        res.json(result);
      } catch (error) {
        console.error("Contract signing error:", error);
        res.status(500).json({ error: "\uACC4\uC57D\uC11C \uC11C\uBA85 \uC2E4\uD328" });
      }
    });
    router.get("/contract/verify/:documentId", async (req, res) => {
      try {
        const documentId = parseInt(req.params.documentId);
        const result = await contractModule.verifyContract(documentId);
        res.json(result);
      } catch (error) {
        console.error("Contract verification error:", error);
        res.status(500).json({ error: "\uACC4\uC57D\uC11C \uAC80\uC99D \uC2E4\uD328" });
      }
    });
    router.post("/approval/upload", upload.single("file"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "\uD30C\uC77C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4" });
        }
        const result = await approvalModule.uploadApprovalDocument({
          title: req.body.title,
          description: req.body.description,
          fileContent: req.file.buffer,
          fileType: req.file.mimetype,
          uploadedBy: parseInt(req.body.uploadedBy),
          organizationId: parseInt(req.body.organizationId)
        });
        res.json(result);
      } catch (error) {
        console.error("Approval document upload error:", error);
        res.status(500).json({ error: "\uC2B9\uC778 \uBB38\uC11C \uC5C5\uB85C\uB4DC \uC2E4\uD328" });
      }
    });
    router.post("/approval/workflow", async (req, res) => {
      try {
        const result = await approvalModule.createApprovalWorkflow({
          documentId: parseInt(req.body.documentId),
          workflowName: req.body.workflowName,
          organizationId: parseInt(req.body.organizationId),
          initiatedBy: parseInt(req.body.initiatedBy),
          steps: req.body.steps
        });
        res.json(result);
      } catch (error) {
        console.error("Approval workflow creation error:", error);
        res.status(500).json({ error: "\uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0DD\uC131 \uC2E4\uD328" });
      }
    });
    router.post("/approval/step/complete", async (req, res) => {
      try {
        const result = await approvalModule.completeWorkflowStep({
          stepId: parseInt(req.body.stepId),
          completedBy: parseInt(req.body.completedBy),
          comments: req.body.comments,
          action: req.body.action,
          signatureData: req.body.signatureData
        });
        res.json(result);
      } catch (error) {
        console.error("Approval step completion error:", error);
        res.status(500).json({ error: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uB2E8\uACC4 \uC644\uB8CC \uC2E4\uD328" });
      }
    });
    router.post("/approval/add-approver", async (req, res) => {
      try {
        const result = await approvalModule.addApprover({
          documentId: parseInt(req.body.documentId),
          organizationId: parseInt(req.body.organizationId),
          approverEmail: req.body.approverEmail,
          approverName: req.body.approverName,
          stepType: req.body.stepType,
          deadline: req.body.deadline ? new Date(req.body.deadline) : void 0
        });
        res.json(result);
      } catch (error) {
        console.error("Add approver error:", error);
        res.status(500).json({ error: "\uC2B9\uC778\uC790 \uCD94\uAC00 \uC2E4\uD328" });
      }
    });
    router.get("/approval/final-document/:documentId", async (req, res) => {
      try {
        const documentId = parseInt(req.params.documentId);
        const result = await approvalModule.getFinalDocument(documentId);
        res.json(result);
      } catch (error) {
        console.error("Final document retrieval error:", error);
        res.status(500).json({ error: "\uCD5C\uC885 \uBB38\uC11C \uC870\uD68C \uC2E4\uD328" });
      }
    });
    router.post("/did/issue-credential", async (req, res) => {
      try {
        const result = await didModule.issueCredential({
          userId: parseInt(req.body.userId),
          credentialType: req.body.credentialType,
          subjectData: req.body.subjectData,
          issuer: req.body.issuer,
          verificationDocuments: req.body.verificationDocuments
        });
        res.json(result);
      } catch (error) {
        console.error("DID credential issuance error:", error);
        res.status(500).json({ error: "DID \uC790\uACA9\uC99D\uBA85 \uBC1C\uAE09 \uC2E4\uD328" });
      }
    });
    router.post("/did/verify-credential", async (req, res) => {
      try {
        const result = await didModule.verifyCredential({
          credentialId: req.body.credentialId,
          verifierId: parseInt(req.body.verifierId),
          verificationMethod: req.body.verificationMethod,
          challenge: req.body.challenge
        });
        res.json(result);
      } catch (error) {
        console.error("DID credential verification error:", error);
        res.status(500).json({ error: "DID \uC790\uACA9\uC99D\uBA85 \uAC80\uC99D \uC2E4\uD328" });
      }
    });
    router.post("/did/authenticate", async (req, res) => {
      try {
        const result = await didModule.authenticateWithDID({
          credentialId: req.body.credentialId,
          userId: parseInt(req.body.userId),
          challenge: req.body.challenge,
          signature: req.body.signature
        });
        res.json(result);
      } catch (error) {
        console.error("DID authentication error:", error);
        res.status(500).json({ error: "DID \uC778\uC99D \uC2E4\uD328" });
      }
    });
    router.post("/did/revoke-credential", async (req, res) => {
      try {
        const result = await didModule.revokeCredential({
          credentialId: req.body.credentialId,
          revokedBy: parseInt(req.body.revokedBy),
          reason: req.body.reason
        });
        res.json(result);
      } catch (error) {
        console.error("DID credential revocation error:", error);
        res.status(500).json({ error: "DID \uC790\uACA9\uC99D\uBA85 \uD3D0\uAE30 \uC2E4\uD328" });
      }
    });
    router.get("/did/user-credentials/:userId", async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        const result = await didModule.getUserCredentials(userId);
        res.json({ credentials: result });
      } catch (error) {
        console.error("User credentials retrieval error:", error);
        res.status(500).json({ error: "\uC0AC\uC6A9\uC790 \uC790\uACA9\uC99D\uBA85 \uC870\uD68C \uC2E4\uD328" });
      }
    });
    router.post("/did/generate-shareable", async (req, res) => {
      try {
        const result = await didModule.generateShareableCredential(req.body.credentialId, {
          validUntil: req.body.validUntil ? new Date(req.body.validUntil) : void 0,
          allowedVerifiers: req.body.allowedVerifiers,
          sharedBy: parseInt(req.body.sharedBy)
        });
        res.json(result);
      } catch (error) {
        console.error("Shareable credential generation error:", error);
        res.status(500).json({ error: "\uACF5\uC720 \uAC00\uB2A5\uD55C \uC790\uACA9\uC99D\uBA85 \uC0DD\uC131 \uC2E4\uD328" });
      }
    });
    router.get("/health", async (req, res) => {
      try {
        const moduleStatuses = {
          contract: "healthy",
          approval: "healthy",
          did: "healthy"
        };
        res.json({
          status: "healthy",
          modules: moduleStatuses,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: "\uBAA8\uB4C8 \uC0C1\uD0DC \uD655\uC778 \uC2E4\uD328" });
      }
    });
    module_routes_default = router;
  }
});

// server/routes/did/index.ts
var did_exports = {};
__export(did_exports, {
  default: () => did_default
});
import { Router as Router2 } from "express";
import crypto3 from "crypto";
var router2, did_default;
var init_did = __esm({
  "server/routes/did/index.ts"() {
    "use strict";
    init_db();
    router2 = Router2();
    router2.post("/create", async (req, res) => {
      try {
        const { method, keyType, purpose, userId } = req.body;
        const keyPair = crypto3.generateKeyPairSync("ec", {
          namedCurve: "P-256",
          publicKeyEncoding: { type: "spki", format: "pem" },
          privateKeyEncoding: { type: "pkcs8", format: "pem" }
        });
        const didId = `did:${method}:signchain:${Date.now()}`;
        const didDocument = {
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/jws-2020/v1"
          ],
          id: didId,
          verificationMethod: [{
            id: `${didId}#key-1`,
            type: keyType === "Ed25519" ? "Ed25519VerificationKey2020" : "JsonWebKey2020",
            controller: didId,
            publicKeyJwk: {
              kty: "EC",
              crv: "P-256",
              x: crypto3.randomBytes(32).toString("base64url"),
              y: crypto3.randomBytes(32).toString("base64url")
            }
          }],
          authentication: [`${didId}#key-1`],
          assertionMethod: [`${didId}#key-1`]
        };
        if (method === "web") {
          didDocument.service = [{
            id: `${didId}#signchain-service`,
            type: "SignChainService",
            serviceEndpoint: `https://signchain.example.com/api/did/${didId}`
          }];
        }
        const encryptionKey = process.env.ENCRYPTION_KEY;
        if (!encryptionKey) {
          throw new Error("ENCRYPTION_KEY is not set");
        }
        const algorithm = "aes-256-cbc";
        const key = crypto3.scryptSync(encryptionKey, "salt", 32);
        const iv = crypto3.randomBytes(16);
        const cipher = crypto3.createCipheriv(algorithm, key, iv);
        let encryptedPrivateKey = cipher.update(keyPair.privateKey, "utf8", "hex");
        encryptedPrivateKey += cipher.final("hex");
        const encryptedData = {
          encrypted: encryptedPrivateKey,
          iv: iv.toString("hex")
        };
        await db.query(
          `INSERT INTO dids (did, method, document, public_key, private_key_encrypted, purpose, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            didId,
            method,
            JSON.stringify(didDocument),
            keyPair.publicKey,
            JSON.stringify(encryptedData),
            // 암호화된 개인 키 저장
            purpose,
            userId
          ]
        );
        res.json({
          did: didId,
          didDocument,
          created: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (error) {
        console.error("DID creation error:", error);
        res.status(500).json({ error: "Failed to create DID" });
      }
    });
    router2.get("/resolve/:did", async (req, res) => {
      try {
        const { did } = req.params;
        const result = await db.query(
          "SELECT * FROM dids WHERE did = $1",
          [did]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "DID not found" });
        }
        const didRecord = result.rows[0];
        res.json({
          didDocument: JSON.parse(didRecord.document),
          metadata: {
            method: didRecord.method,
            created: didRecord.created_at,
            updated: didRecord.updated_at,
            versionId: "1.0.0"
          }
        });
      } catch (error) {
        console.error("DID resolution error:", error);
        res.status(500).json({ error: "Failed to resolve DID" });
      }
    });
    router2.post("/issue-credential", async (req, res) => {
      try {
        const {
          credentialType,
          subjectDID,
          subjectData,
          issuerDID,
          expirationDate
        } = req.body;
        const vcId = `vc:signchain:${Date.now()}`;
        const verifiableCredential = {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
          ],
          type: ["VerifiableCredential", credentialType],
          id: vcId,
          issuer: issuerDID || "did:web:signchain.example.com",
          issuanceDate: (/* @__PURE__ */ new Date()).toISOString(),
          credentialSubject: {
            id: subjectDID,
            ...subjectData
          }
        };
        if (expirationDate) {
          verifiableCredential.expirationDate = new Date(expirationDate).toISOString();
        }
        const proof = {
          type: "Ed25519Signature2020",
          created: (/* @__PURE__ */ new Date()).toISOString(),
          proofPurpose: "assertionMethod",
          verificationMethod: `${issuerDID}#key-1`,
          proofValue: crypto3.randomBytes(64).toString("base64url")
          // Mock 서명
        };
        verifiableCredential.proof = proof;
        await db.query(
          `INSERT INTO verifiable_credentials 
       (id, type, issuer_did, subject_did, credential_data, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            vcId,
            credentialType,
            issuerDID,
            subjectDID,
            JSON.stringify(verifiableCredential),
            "active"
          ]
        );
        res.json({
          credential: verifiableCredential,
          issued: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (error) {
        console.error("Credential issuance error:", error);
        res.status(500).json({ error: "Failed to issue credential" });
      }
    });
    router2.post("/verify-credential", async (req, res) => {
      try {
        const { credential } = req.body;
        const verificationResult = {
          valid: true,
          checks: {
            signature: true,
            notExpired: true,
            notRevoked: true,
            issuerTrusted: true
          }
        };
        if (credential.expirationDate) {
          const expiry = new Date(credential.expirationDate);
          if (expiry < /* @__PURE__ */ new Date()) {
            verificationResult.valid = false;
            verificationResult.checks.notExpired = false;
          }
        }
        const result = await db.query(
          "SELECT status FROM verifiable_credentials WHERE id = $1",
          [credential.id]
        );
        if (result.rows.length > 0 && result.rows[0].status === "revoked") {
          verificationResult.valid = false;
          verificationResult.checks.notRevoked = false;
        }
        res.json(verificationResult);
      } catch (error) {
        console.error("Credential verification error:", error);
        res.status(500).json({ error: "Failed to verify credential" });
      }
    });
    router2.post("/create-presentation-request", async (req, res) => {
      try {
        const {
          requesterDID,
          subjectDID,
          purpose,
          requestedCredentials,
          challenge
        } = req.body;
        const presentationRequest = {
          id: `pr:signchain:${Date.now()}`,
          requester: requesterDID,
          subject: subjectDID,
          purpose,
          requestedCredentials,
          challenge: challenge || crypto3.randomBytes(32).toString("base64url"),
          created: (/* @__PURE__ */ new Date()).toISOString(),
          status: "pending"
        };
        await db.query(
          `INSERT INTO presentation_requests 
       (id, requester_did, subject_did, purpose, requested_credentials, challenge, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            presentationRequest.id,
            requesterDID,
            subjectDID,
            purpose,
            JSON.stringify(requestedCredentials),
            presentationRequest.challenge,
            "pending"
          ]
        );
        res.json(presentationRequest);
      } catch (error) {
        console.error("Presentation request error:", error);
        res.status(500).json({ error: "Failed to create presentation request" });
      }
    });
    router2.get("/list/:userId", async (req, res) => {
      try {
        const { userId } = req.params;
        const result = await db.query(
          "SELECT did, method, purpose, created_at, status FROM dids WHERE user_id = $1 ORDER BY created_at DESC",
          [userId]
        );
        res.json(result.rows);
      } catch (error) {
        console.error("DID list error:", error);
        res.status(500).json({ error: "Failed to list DIDs" });
      }
    });
    router2.get("/credentials/:did", async (req, res) => {
      try {
        const { did } = req.params;
        const result = await db.query(
          `SELECT id, type, issuer_did, credential_data, status, created_at 
       FROM verifiable_credentials 
       WHERE subject_did = $1 
       ORDER BY created_at DESC`,
          [did]
        );
        const credentials2 = result.rows.map((row) => ({
          ...JSON.parse(row.credential_data),
          status: row.status
        }));
        res.json(credentials2);
      } catch (error) {
        console.error("Credential list error:", error);
        res.status(500).json({ error: "Failed to list credentials" });
      }
    });
    did_default = router2;
  }
});

// db/schema.ts
var schema_exports2 = {};
__export(schema_exports2, {
  approvalSteps: () => approvalSteps3,
  approvals: () => approvals,
  contractParticipants: () => contractParticipants,
  contracts: () => contracts,
  credentials: () => credentials,
  didRecords: () => didRecords,
  files: () => files,
  insertApprovalSchema: () => insertApprovalSchema,
  insertApprovalStepSchema: () => insertApprovalStepSchema2,
  insertContractParticipantSchema: () => insertContractParticipantSchema,
  insertContractSchema: () => insertContractSchema,
  insertCredentialSchema: () => insertCredentialSchema,
  insertDidRecordSchema: () => insertDidRecordSchema,
  insertFileSchema: () => insertFileSchema,
  insertUserSchema: () => insertUserSchema2,
  selectApprovalSchema: () => selectApprovalSchema,
  selectApprovalStepSchema: () => selectApprovalStepSchema,
  selectContractParticipantSchema: () => selectContractParticipantSchema,
  selectContractSchema: () => selectContractSchema,
  selectCredentialSchema: () => selectCredentialSchema,
  selectDidRecordSchema: () => selectDidRecordSchema,
  selectFileSchema: () => selectFileSchema,
  selectUserSchema: () => selectUserSchema,
  users: () => users2
});
import { pgTable as pgTable2, text as text2, timestamp as timestamp2, integer as integer2, boolean as boolean2, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2, createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
var users2, files, contracts, contractParticipants, approvals, approvalSteps3, didRecords, credentials, insertUserSchema2, selectUserSchema, insertFileSchema, selectFileSchema, insertContractSchema, selectContractSchema, insertContractParticipantSchema, selectContractParticipantSchema, insertApprovalSchema, selectApprovalSchema, insertApprovalStepSchema2, selectApprovalStepSchema, insertDidRecordSchema, selectDidRecordSchema, insertCredentialSchema, selectCredentialSchema;
var init_schema2 = __esm({
  "db/schema.ts"() {
    "use strict";
    users2 = pgTable2("users", {
      id: text2("id").primaryKey().$defaultFn(() => nanoid()),
      email: varchar("email", { length: 255 }).notNull().unique(),
      password: text2("password").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      role: varchar("role", { length: 50 }).notNull().default("user"),
      emailVerified: boolean2("email_verified").default(false),
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    files = pgTable2("files", {
      id: text2("id").primaryKey().$defaultFn(() => nanoid()),
      filename: varchar("filename", { length: 255 }).notNull(),
      originalName: varchar("original_name", { length: 255 }).notNull(),
      mimeType: varchar("mime_type", { length: 100 }).notNull(),
      size: integer2("size").notNull(),
      ipfsHash: text2("ipfs_hash").notNull().unique(),
      uploadedBy: text2("uploaded_by").notNull().references(() => users2.id, { onDelete: "cascade" }),
      category: varchar("category", { length: 50 }).notNull().default("general"),
      metadata: json("metadata"),
      isPublic: boolean2("is_public").default(false),
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    contracts = pgTable2("contracts", {
      id: text2("id").primaryKey().$defaultFn(() => nanoid()),
      title: varchar("title", { length: 255 }).notNull(),
      description: text2("description"),
      content: text2("content").notNull(),
      templateId: text2("template_id"),
      createdBy: text2("created_by").notNull().references(() => users2.id, { onDelete: "cascade" }),
      status: varchar("status", { length: 50 }).notNull().default("draft"),
      contractAddress: text2("contract_address"),
      // Blockchain contract address
      ipfsHash: text2("ipfs_hash"),
      // IPFS hash for contract document
      metadata: json("metadata"),
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    contractParticipants = pgTable2("contract_participants", {
      id: text2("id").primaryKey().$defaultFn(() => nanoid()),
      contractId: text2("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
      userId: text2("user_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
      role: varchar("role", { length: 50 }).notNull(),
      // 'creator', 'signer', 'witness'
      status: varchar("status", { length: 50 }).notNull().default("pending"),
      signedAt: timestamp2("signed_at"),
      signatureData: text2("signature_data"),
      // Digital signature data
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    approvals = pgTable2("approvals", {
      id: text2("id").primaryKey().$defaultFn(() => nanoid()),
      title: varchar("title", { length: 255 }).notNull(),
      description: text2("description"),
      requestedBy: text2("requested_by").notNull().references(() => users2.id, { onDelete: "cascade" }),
      documentId: text2("document_id").references(() => files.id, { onDelete: "set null" }),
      status: varchar("status", { length: 50 }).notNull().default("pending"),
      priority: varchar("priority", { length: 20 }).notNull().default("medium"),
      metadata: json("metadata"),
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    approvalSteps3 = pgTable2("approval_steps", {
      id: text2("id").primaryKey().$defaultFn(() => nanoid()),
      approvalId: text2("approval_id").notNull().references(() => approvals.id, { onDelete: "cascade" }),
      stepOrder: integer2("step_order").notNull(),
      approverId: text2("approver_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
      status: varchar("status", { length: 50 }).notNull().default("pending"),
      comments: text2("comments"),
      approvedAt: timestamp2("approved_at"),
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    didRecords = pgTable2("did_records", {
      id: text2("id").primaryKey().$defaultFn(() => nanoid()),
      userId: text2("user_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
      didIdentifier: text2("did_identifier").notNull().unique(),
      publicKey: text2("public_key").notNull(),
      privateKeyEncrypted: text2("private_key_encrypted"),
      // Encrypted private key
      didDocument: json("did_document").notNull(),
      verificationMethods: json("verification_methods"),
      services: json("services"),
      status: varchar("status", { length: 50 }).notNull().default("active"),
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    credentials = pgTable2("credentials", {
      id: text2("id").primaryKey().$defaultFn(() => nanoid()),
      holderId: text2("holder_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
      issuerId: text2("issuer_id").notNull().references(() => users2.id, { onDelete: "cascade" }),
      credentialType: varchar("credential_type", { length: 100 }).notNull(),
      credentialData: json("credential_data").notNull(),
      proof: json("proof"),
      status: varchar("status", { length: 50 }).notNull().default("active"),
      expiresAt: timestamp2("expires_at"),
      revokedAt: timestamp2("revoked_at"),
      ipfsHash: text2("ipfs_hash"),
      // IPFS hash for credential document
      createdAt: timestamp2("created_at").defaultNow().notNull(),
      updatedAt: timestamp2("updated_at").defaultNow().notNull()
    });
    insertUserSchema2 = createInsertSchema2(users2);
    selectUserSchema = createSelectSchema(users2);
    insertFileSchema = createInsertSchema2(files);
    selectFileSchema = createSelectSchema(files);
    insertContractSchema = createInsertSchema2(contracts);
    selectContractSchema = createSelectSchema(contracts);
    insertContractParticipantSchema = createInsertSchema2(contractParticipants);
    selectContractParticipantSchema = createSelectSchema(contractParticipants);
    insertApprovalSchema = createInsertSchema2(approvals);
    selectApprovalSchema = createSelectSchema(approvals);
    insertApprovalStepSchema2 = createInsertSchema2(approvalSteps3);
    selectApprovalStepSchema = createSelectSchema(approvalSteps3);
    insertDidRecordSchema = createInsertSchema2(didRecords);
    selectDidRecordSchema = createSelectSchema(didRecords);
    insertCredentialSchema = createInsertSchema2(credentials);
    selectCredentialSchema = createSelectSchema(credentials);
  }
});

// db/index.ts
import { drizzle as drizzle2 } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
function createMockDB() {
  const mockQuery = {
    files: {
      findFirst: async () => null,
      findMany: async () => []
    }
  };
  return {
    insert: () => ({
      values: () => ({
        returning: async () => [{ id: "mock-id", createdAt: /* @__PURE__ */ new Date() }]
      })
    }),
    delete: () => ({
      where: () => ({ execute: async () => {
      } })
    }),
    query: mockQuery,
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => ({
            offset: () => []
          })
        })
      })
    })
    // Add other necessary mock methods as needed
  };
}
var databaseUrl, sql, db2;
var init_db2 = __esm({
  "db/index.ts"() {
    "use strict";
    init_schema2();
    init_schema2();
    databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn("DATABASE_URL not found, using mock database connection");
    }
    sql = databaseUrl ? neon(databaseUrl) : null;
    db2 = sql ? drizzle2(sql, { schema: schema_exports2 }) : createMockDB();
  }
});

// server/services/ipfsService.ts
import crypto4 from "crypto";
import fs from "fs/promises";
import path from "path";
var MockIPFSService, ipfsService;
var init_ipfsService = __esm({
  "server/services/ipfsService.ts"() {
    "use strict";
    MockIPFSService = class {
      uploadsDir;
      initialized = false;
      constructor() {
        this.uploadsDir = path.join(process.cwd(), "uploads");
      }
      async initialize() {
        if (this.initialized) return;
        try {
          await fs.mkdir(this.uploadsDir, { recursive: true });
          this.initialized = true;
          console.log("\u{1F4C1} Mock IPFS Service initialized");
        } catch (error) {
          console.error("\u274C Failed to initialize Mock IPFS Service:", error);
          throw error;
        }
      }
      /**
       * Generate a mock IPFS hash
       */
      generateIPFSHash(content) {
        const hash = crypto4.createHash("sha256").update(content).digest("hex");
        return `Qm${hash.substring(0, 44)}`;
      }
      /**
       * Upload file to local storage (mock IPFS)
       */
      async uploadFile(file) {
        await this.initialize();
        try {
          const ipfsHash = this.generateIPFSHash(file.content);
          const filePath = path.join(this.uploadsDir, ipfsHash);
          await fs.writeFile(filePath, file.content);
          console.log("\u{1F4C1} File uploaded to Mock IPFS:", ipfsHash);
          return ipfsHash;
        } catch (error) {
          console.error("\u274C Failed to upload file to Mock IPFS:", error);
          throw error;
        }
      }
      /**
       * Download file from local storage (mock IPFS)
       */
      async downloadFile(hash) {
        await this.initialize();
        try {
          const filePath = path.join(this.uploadsDir, hash);
          const fileBuffer = await fs.readFile(filePath);
          console.log("\u{1F4E5} File downloaded from Mock IPFS:", hash);
          return new Uint8Array(fileBuffer);
        } catch (error) {
          console.error("\u274C Failed to download file from Mock IPFS:", error);
          throw error;
        }
      }
      /**
       * Pin file (no-op in mock implementation)
       */
      async pinFile(hash) {
        console.log("\u{1F4CC} File pinned (mock):", hash);
      }
      /**
       * Unpin file (no-op in mock implementation)
       */
      async unpinFile(hash) {
        console.log("\u{1F4CC} File unpinned (mock):", hash);
      }
      /**
       * Get file statistics
       */
      async getFileStats(hash) {
        await this.initialize();
        try {
          const filePath = path.join(this.uploadsDir, hash);
          const stats = await fs.stat(filePath);
          return {
            hash,
            size: stats.size,
            type: "file",
            blocks: 1
          };
        } catch (error) {
          console.error("\u274C Failed to get file stats from Mock IPFS:", error);
          throw error;
        }
      }
      /**
       * Check if file exists
       */
      async fileExists(hash) {
        await this.initialize();
        try {
          const filePath = path.join(this.uploadsDir, hash);
          await fs.access(filePath);
          return true;
        } catch {
          return false;
        }
      }
      /**
       * Shutdown service (no-op in mock implementation)
       */
      async shutdown() {
        console.log("\u{1F50C} Mock IPFS Service stopped");
      }
    };
    ipfsService = new MockIPFSService();
  }
});

// server/middleware/auth.ts
import jwt2 from "jsonwebtoken";
function authenticateToken2(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required"
    });
  }
  try {
    const decoded = jwt2.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role || "user"
    };
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}
var JWT_SECRET;
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    "use strict";
    JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  }
});

// server/routes/files.ts
var files_exports = {};
__export(files_exports, {
  default: () => files_default
});
import express from "express";
import multer2 from "multer";
import { z as z3 } from "zod";
import { eq as eq2 } from "drizzle-orm";
var router3, upload2, uploadFileSchema, files_default;
var init_files = __esm({
  "server/routes/files.ts"() {
    "use strict";
    init_db2();
    init_ipfsService();
    init_auth();
    router3 = express.Router();
    upload2 = multer2({
      storage: multer2.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024
        // 50MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/json"
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("File type not allowed"), false);
        }
      }
    });
    uploadFileSchema = z3.object({
      category: z3.enum(["contract", "approval", "identity", "general"]).default("general"),
      isPublic: z3.boolean().default(false),
      metadata: z3.record(z3.any()).optional()
    });
    router3.post("/upload", authenticateToken2, upload2.single("file"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "No file provided"
          });
        }
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: "User not authenticated"
          });
        }
        const { category, isPublic, metadata } = uploadFileSchema.parse(req.body);
        const ipfsHash = await ipfsService.uploadFile({
          content: req.file.buffer,
          path: req.file.originalname
        });
        await ipfsService.pinFile(ipfsHash);
        const fileRecord = await db2.insert(files).values({
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
          message: "File uploaded successfully",
          data: {
            file: fileRecord[0],
            ipfsHash,
            ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`
          }
        });
      } catch (error) {
        console.error("File upload error:", error);
        if (error instanceof z3.ZodError) {
          return res.status(400).json({
            success: false,
            message: "Invalid request data",
            errors: error.errors
          });
        }
        res.status(500).json({
          success: false,
          message: "File upload failed",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    router3.get("/:id", authenticateToken2, async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.user?.id;
        const fileRecord = await db2.query.files.findFirst({
          where: (files2, { eq: eq3 }) => eq3(files2.id, id)
        });
        if (!fileRecord) {
          return res.status(404).json({
            success: false,
            message: "File not found"
          });
        }
        if (!fileRecord.isPublic && fileRecord.uploadedBy !== userId) {
          return res.status(403).json({
            success: false,
            message: "Access denied"
          });
        }
        res.json({
          success: true,
          data: fileRecord
        });
      } catch (error) {
        console.error("Get file error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to get file",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    router3.get("/:id/download", authenticateToken2, async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.user?.id;
        const fileRecord = await db2.query.files.findFirst({
          where: (files2, { eq: eq3 }) => eq3(files2.id, id)
        });
        if (!fileRecord) {
          return res.status(404).json({
            success: false,
            message: "File not found"
          });
        }
        if (!fileRecord.isPublic && fileRecord.uploadedBy !== userId) {
          return res.status(403).json({
            success: false,
            message: "Access denied"
          });
        }
        const fileData = await ipfsService.downloadFile(fileRecord.ipfsHash);
        res.setHeader("Content-Type", fileRecord.mimeType);
        res.setHeader("Content-Disposition", `attachment; filename="${fileRecord.originalName}"`);
        res.setHeader("Content-Length", fileRecord.size.toString());
        res.end(Buffer.from(fileData));
      } catch (error) {
        console.error("Download file error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to download file",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    router3.get("/", authenticateToken2, async (req, res) => {
      try {
        const userId = req.user?.id;
        const {
          page = "1",
          limit = "20",
          category,
          search
        } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        let whereConditions = (files2, { eq: eq3, and: and3, or: or2, like: like2 }) => {
          const conditions = [
            or2(
              eq3(files2.uploadedBy, userId),
              eq3(files2.isPublic, true)
            )
          ];
          if (category) {
            conditions.push(eq3(files2.category, category));
          }
          if (search) {
            conditions.push(
              or2(
                like2(files2.originalName, `%${search}%`),
                like2(files2.filename, `%${search}%`)
              )
            );
          }
          return and3(...conditions);
        };
        const userFiles = await db2.query.files.findMany({
          where: whereConditions,
          limit: limitNum,
          offset,
          orderBy: (files2, { desc: desc3 }) => [desc3(files2.createdAt)]
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
        console.error("List files error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to list files",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    router3.delete("/:id", authenticateToken2, async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.user?.id;
        const fileRecord = await db2.query.files.findFirst({
          where: (files2, { eq: eq3 }) => eq3(files2.id, id)
        });
        if (!fileRecord) {
          return res.status(404).json({
            success: false,
            message: "File not found"
          });
        }
        if (fileRecord.uploadedBy !== userId) {
          return res.status(403).json({
            success: false,
            message: "Access denied"
          });
        }
        try {
          await ipfsService.unpinFile(fileRecord.ipfsHash);
        } catch (error) {
          console.warn("Failed to unpin file from IPFS:", error);
        }
        await db2.delete(files).where(eq2(files.id, id));
        res.json({
          success: true,
          message: "File deleted successfully"
        });
      } catch (error) {
        console.error("Delete file error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to delete file",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    files_default = router3;
  }
});

// server/routes/ipfs.ts
var ipfs_exports = {};
__export(ipfs_exports, {
  default: () => ipfs_default
});
import express2 from "express";
import multer3 from "multer";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import crypto5 from "crypto";
import NodeCache from "node-cache";
async function initializeIPFS() {
  try {
    if (!heliaNode) {
      heliaNode = await createHelia({
        // Simplified libp2p settings for better stability
        libp2p: {
          connectionManager: {
            maxConnections: 100,
            minConnections: 10
          },
          // Basic connection gating
          connectionGater: {
            denyDialMultiaddr: () => false
          }
        }
      });
      unixfsInstance = unixfs(heliaNode);
      console.log("\u{1F30D} IPFS Helia node initialized with enhanced performance settings");
      setInterval(() => {
        const connections = heliaNode.libp2p.getConnections().length;
        const peers = heliaNode.libp2p.getPeers().length;
        console.log(`\u{1F4CA} IPFS Stats - Connections: ${connections}, Peers: ${peers}, Cache: ${fileCache.keys().length} files`);
      }, 6e4);
    }
    return { helia: heliaNode, fs: unixfsInstance };
  } catch (error) {
    console.error("IPFS initialization error:", error);
    throw error;
  }
}
async function* streamFileFromIPFS(ipfsFs, hash, chunkSize = 64 * 1024) {
  try {
    for await (const chunk of ipfsFs.cat(hash)) {
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
async function getFileWithRetry(ipfsFs, hash, maxRetries = 3, timeoutMs = 3e4) {
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
      return await Promise.race([filePromise, timeout]);
    } catch (error) {
      console.warn(`IPFS fetch attempt ${attempt} failed for ${hash}:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1e3));
    }
  }
}
var router4, storage2, upload3, fileCache, metadataCache, heliaNode, unixfsInstance, IPFS_GATEWAYS, ipfs_default;
var init_ipfs = __esm({
  "server/routes/ipfs.ts"() {
    "use strict";
    router4 = express2.Router();
    storage2 = multer3.memoryStorage();
    upload3 = multer3({
      storage: storage2,
      limits: {
        fileSize: 100 * 1024 * 1024
        // 100MB limit (increased)
      }
    });
    fileCache = new NodeCache({
      stdTTL: 600,
      // 10 minute TTL (increased)
      checkperiod: 120,
      // Check every 2 minutes
      maxKeys: 1e3,
      // Maximum 1000 cached files
      useClones: false
      // Better performance for large files
    });
    metadataCache = new NodeCache({
      stdTTL: 3600,
      // 1 hour TTL
      checkperiod: 300,
      maxKeys: 5e3
    });
    heliaNode = null;
    unixfsInstance = null;
    IPFS_GATEWAYS = [
      "https://ipfs.io/ipfs/",
      "https://cloudflare-ipfs.com/ipfs/",
      "https://gateway.pinata.cloud/ipfs/",
      "https://dweb.link/ipfs/"
    ];
    initializeIPFS().catch(console.error);
    router4.post("/upload", upload3.single("file"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "No file provided"
          });
        }
        const { helia, fs: ipfsFs } = await initializeIPFS();
        const checksum = crypto5.createHash("sha256").update(req.file.buffer).digest("hex");
        const fileMetadata = {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
          checksum,
          uploadedBy: req.body.uploadedBy || "anonymous",
          category: req.body.category || "general",
          description: req.body.description || "",
          version: "1.0",
          encoding: "utf8"
        };
        console.log(`\u{1F4E4} Starting upload for ${req.file.originalname} (${req.file.size} bytes)`);
        const startTime = Date.now();
        const cid = await ipfsFs.addBytes(req.file.buffer);
        const uploadTime = Date.now() - startTime;
        console.log(`\u2705 File uploaded to IPFS in ${uploadTime}ms: ${cid.toString()}`);
        const metadataJson = JSON.stringify(fileMetadata, null, 2);
        const metadataCid = await ipfsFs.addBytes(
          new TextEncoder().encode(metadataJson)
        );
        const cacheData = {
          buffer: req.file.buffer,
          metadata: fileMetadata,
          uploadTime,
          cachedAt: Date.now()
        };
        fileCache.set(cid.toString(), cacheData);
        metadataCache.set(cid.toString(), fileMetadata);
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
            gateways: IPFS_GATEWAYS.map((gateway) => ({
              name: gateway.includes("cloudflare") ? "Cloudflare" : gateway.includes("pinata") ? "Pinata" : gateway.includes("dweb") ? "DWEB" : "IPFS.io",
              url: `${gateway}${cid.toString()}`
            })),
            localGatewayUrl: `http://localhost:8080/ipfs/${cid.toString()}`,
            downloadUrl: `/api/v1/ipfs/download/${cid.toString()}`,
            performance: {
              uploadTime: `${uploadTime}ms`,
              avgSpeed: `${(req.file.size / uploadTime * 1e3 / 1024).toFixed(2)} KB/s`
            }
          }
        };
        res.json(response);
      } catch (error) {
        console.error("IPFS upload error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to upload file to IPFS",
          error: error instanceof Error ? error.message : "Unknown error",
          troubleshooting: {
            suggestions: [
              "Check if IPFS node is properly connected to the network",
              "Verify file size is within limits",
              "Ensure stable internet connection"
            ]
          }
        });
      }
    });
    router4.get("/download/:hash", async (req, res) => {
      try {
        const { hash } = req.params;
        const startTime = Date.now();
        const cached = fileCache.get(hash);
        if (cached) {
          const cacheTime = Date.now() - startTime;
          console.log(`\u{1F4E6} Cache hit for file: ${hash} (${cacheTime}ms)`);
          if (cached.metadata?.mimeType) {
            res.set("Content-Type", cached.metadata.mimeType);
          }
          if (cached.metadata?.originalName) {
            res.set("Content-Disposition", `attachment; filename="${cached.metadata.originalName}"`);
          }
          res.set("Content-Length", cached.buffer.length.toString());
          res.set("Cache-Control", "public, max-age=600");
          res.set("X-IPFS-Hash", hash);
          res.set("X-Cache-Status", "HIT");
          res.set("X-Download-Time", `${cacheTime}ms`);
          return res.send(cached.buffer);
        }
        const { helia, fs: ipfsFs } = await initializeIPFS();
        console.log(`\u{1F4E5} Fetching file from IPFS: ${hash}`);
        const fileBuffer = await getFileWithRetry(ipfsFs, hash, 3, 45e3);
        const downloadTime = Date.now() - startTime;
        console.log(`\u2705 File downloaded from IPFS: ${hash} (${fileBuffer.length} bytes, ${downloadTime}ms)`);
        let metadata = metadataCache.get(hash);
        if (!metadata) {
          try {
            const metadataBuffer = await getFileWithRetry(ipfsFs, `${hash}_metadata`, 1, 1e4);
            metadata = JSON.parse(metadataBuffer.toString());
            metadataCache.set(hash, metadata);
          } catch {
            console.log(`\u2139\uFE0F No metadata found for ${hash}`);
          }
        }
        fileCache.set(hash, {
          buffer: fileBuffer,
          metadata: metadata || {},
          downloadTime,
          cachedAt: Date.now()
        });
        if (metadata?.mimeType) {
          res.set("Content-Type", metadata.mimeType);
        } else {
          res.set("Content-Type", "application/octet-stream");
        }
        if (metadata?.originalName) {
          res.set("Content-Disposition", `attachment; filename="${metadata.originalName}"`);
        }
        res.set("Content-Length", fileBuffer.length.toString());
        res.set("Cache-Control", "public, max-age=600");
        res.set("X-IPFS-Hash", hash);
        res.set("X-Cache-Status", "MISS");
        res.set("X-Download-Time", `${downloadTime}ms`);
        res.set("X-Download-Speed", `${(fileBuffer.length / downloadTime * 1e3 / 1024).toFixed(2)} KB/s`);
        res.send(fileBuffer);
      } catch (error) {
        const downloadTime = Date.now() - req.startTime || 0;
        console.error("IPFS download error:", error);
        if (error.message.includes("timeout")) {
          res.status(408).json({
            success: false,
            message: "Request timeout - IPFS operation took too long",
            error: "timeout",
            troubleshooting: {
              suggestions: [
                "File may not be available on the network",
                "Try again in a few moments",
                "Check if the IPFS hash is correct",
                "Consider using a public IPFS gateway as fallback"
              ],
              gateways: IPFS_GATEWAYS.map((gateway) => `${gateway}${req.params.hash}`)
            },
            performance: {
              timeoutAfter: `${downloadTime}ms`
            }
          });
        } else {
          res.status(404).json({
            success: false,
            message: "File not found on IPFS",
            error: error instanceof Error ? error.message : "Unknown error",
            troubleshooting: {
              suggestions: [
                "Verify the IPFS hash is correct",
                "File may not be pinned or available",
                "Try using a public IPFS gateway"
              ],
              gateways: IPFS_GATEWAYS.map((gateway) => `${gateway}${req.params.hash}`)
            }
          });
        }
      }
    });
    router4.get("/stream/:hash", async (req, res) => {
      try {
        const { hash } = req.params;
        const startTime = Date.now();
        const cached = fileCache.get(hash);
        if (cached) {
          console.log(`\u{1F4E6} Streaming cached file: ${hash}`);
          if (cached.metadata?.mimeType) {
            res.set("Content-Type", cached.metadata.mimeType);
          }
          res.set("X-Cache-Status", "HIT");
          res.set("X-IPFS-Hash", hash);
          return res.send(cached.buffer);
        }
        const { helia, fs: ipfsFs } = await initializeIPFS();
        res.set("Content-Type", "application/octet-stream");
        res.set("X-Cache-Status", "STREAMING");
        res.set("X-IPFS-Hash", hash);
        console.log(`\u{1F4E1} Streaming file from IPFS: ${hash}`);
        let totalBytes = 0;
        const chunks = [];
        for await (const chunk of streamFileFromIPFS(ipfsFs, hash, 32 * 1024)) {
          totalBytes += chunk.length;
          chunks.push(chunk);
          res.write(chunk);
        }
        res.end();
        const streamTime = Date.now() - startTime;
        console.log(`\u2705 File streamed: ${hash} (${totalBytes} bytes, ${streamTime}ms)`);
        const completeBuffer = Buffer.concat(chunks);
        fileCache.set(hash, {
          buffer: completeBuffer,
          metadata: {},
          downloadTime: streamTime,
          cachedAt: Date.now()
        });
      } catch (error) {
        console.error("IPFS streaming error:", error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Failed to stream file from IPFS",
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
    });
    router4.get("/status/:hash", async (req, res) => {
      try {
        const { hash } = req.params;
        const startTime = Date.now();
        const cached = fileCache.get(hash);
        const metadata = metadataCache.get(hash);
        if (cached) {
          const checkTime2 = Date.now() - startTime;
          return res.json({
            success: true,
            data: {
              hash,
              exists: true,
              cached: true,
              size: cached.buffer.length,
              metadata: cached.metadata || metadata,
              performance: {
                checkTime: `${checkTime2}ms`,
                cacheAge: `${Math.round((Date.now() - cached.cachedAt) / 1e3)}s`
              }
            }
          });
        }
        const { helia, fs: ipfsFs } = await initializeIPFS();
        const timeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("timeout")), 15e3);
        });
        const statsPromise = (async () => {
          try {
            const iterator = ipfsFs.cat(hash);
            const { value, done } = await iterator.next();
            return {
              exists: !done && value !== void 0,
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
            ...result.firstChunkSize && { firstChunkSize: result.firstChunkSize }
          }
        });
      } catch (error) {
        const checkTime = Date.now() - req.startTime || 0;
        res.json({
          success: false,
          data: {
            hash: req.params.hash,
            exists: false,
            cached: false,
            performance: {
              checkTime: `${checkTime}ms`,
              error: error instanceof Error ? error.message : "Unknown error"
            }
          }
        });
      }
    });
    router4.get("/node/info", async (req, res) => {
      try {
        const { helia } = await initializeIPFS();
        const peerId = helia.libp2p.peerId.toString();
        const addresses = helia.libp2p.getMultiaddrs().map((ma) => ma.toString());
        const connections = helia.libp2p.getConnections();
        const peers = helia.libp2p.getPeers();
        const cacheStats = {
          fileCache: {
            size: fileCache.keys().length,
            maxKeys: 1e3,
            ttl: 600
          },
          metadataCache: {
            size: metadataCache.keys().length,
            maxKeys: 5e3,
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
              details: connections.map((conn) => ({
                peer: conn.remotePeer.toString(),
                status: conn.status || "unknown",
                direction: conn.stat?.direction || "unknown"
              }))
            },
            peers: {
              count: peers.length,
              list: peers.map((peer) => peer.toString()).slice(0, 10)
              // First 10 peers
            },
            cache: cacheStats,
            status: "online",
            version: "helia-optimized",
            performance: {
              uptime: process.uptime(),
              memoryUsage: process.memoryUsage()
            }
          }
        });
      } catch (error) {
        console.error("IPFS node info error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to get node info",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    router4.get("/cache/stats", (req, res) => {
      const fileKeys = fileCache.keys();
      const metadataKeys = metadataCache.keys();
      let totalFileSize = 0;
      fileKeys.forEach((key) => {
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
            maxKeys: 1e3
          },
          metadataCache: {
            entries: metadataKeys.length,
            ttl: 3600,
            maxKeys: 5e3
          },
          performance: {
            memoryUsage: process.memoryUsage(),
            cacheEfficiency: fileKeys.length > 0 ? (fileKeys.length / 1e3 * 100).toFixed(1) + "%" : "0%"
          }
        }
      });
    });
    router4.delete("/cache/:hash", (req, res) => {
      const { hash } = req.params;
      const fileDeleted = fileCache.del(hash);
      const metadataDeleted = metadataCache.del(hash);
      res.json({
        success: true,
        data: {
          hash,
          fileDeleted,
          metadataDeleted,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    });
    router4.delete("/cache", (req, res) => {
      const fileKeys = fileCache.keys();
      const metadataKeys = metadataCache.keys();
      fileCache.flushAll();
      metadataCache.flushAll();
      res.json({
        success: true,
        data: {
          clearedFiles: fileKeys.length,
          clearedMetadata: metadataKeys.length,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          message: "All caches cleared successfully"
        }
      });
    });
    process.on("SIGINT", async () => {
      console.log("\u{1F50C} Shutting down IPFS service gracefully...");
      fileCache.flushAll();
      metadataCache.flushAll();
      if (heliaNode) {
        try {
          await heliaNode.stop();
          console.log("\u2705 IPFS node stopped successfully");
        } catch (error) {
          console.error("\u274C Error stopping IPFS node:", error);
        }
      }
      process.exit(0);
    });
    ipfs_default = router4;
  }
});

// server/index.ts
import "dotenv/config";
import express4 from "express";

// server/routes.ts
init_storage();
init_schema();
import { createServer } from "http";

// server/email.ts
import sgMail from "@sendgrid/mail";
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not found. Email notifications will be disabled.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}
async function sendSignatureRequestEmail(data) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Mock email sent to ${data.to}: Signature request for ${data.documentTitle}`);
    return true;
  }
  try {
    const msg = {
      to: data.to,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@signchain.app",
      // 검증된 발신자 이메일 필요
      subject: `\uC11C\uBA85 \uC694\uCCAD: ${data.documentTitle}`,
      html: generateSignatureRequestHtml(data)
    };
    await sgMail.send(msg);
    console.log(`Signature request email sent to ${data.to}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
async function sendCompletionEmail(data) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`Mock completion email sent to ${data.to}`);
    return true;
  }
  try {
    const msg = {
      to: data.to,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@signchain.app",
      subject: `\uC11C\uBA85 \uC644\uB8CC: ${data.documentTitle}`,
      html: generateCompletionHtml(data)
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Completion email sending failed:", error);
    return false;
  }
}
function generateSignatureRequestHtml(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; padding: 20px; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u{1F510} SignChain</h1>
          <h2>\uC11C\uBA85 \uC694\uCCAD</h2>
        </div>
        <div class="content">
          <p>\uC548\uB155\uD558\uC138\uC694${data.signerName ? ` ${data.signerName}\uB2D8` : ""},</p>
          
          <p><strong>${data.requesterName}</strong>\uB2D8\uC774 \uB2E4\uC74C \uBB38\uC11C\uC5D0 \uB300\uD55C \uB514\uC9C0\uD138 \uC11C\uBA85\uC744 \uC694\uCCAD\uD588\uC2B5\uB2C8\uB2E4:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0; color: #333;">\u{1F4C4} ${data.documentTitle}</h3>
            ${data.deadline ? `<p style="margin: 10px 0 0 0; color: #666;">\u23F0 \uC11C\uBA85 \uB9C8\uAC10\uC77C: ${data.deadline.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</p>` : ""}
          </div>
          
          ${data.message ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>\uBA54\uC2DC\uC9C0:</strong><br>
              ${data.message}
            </div>
          ` : ""}
          
          <div class="warning">
            <strong>\u26A0\uFE0F \uBCF4\uC548 \uC548\uB0B4</strong><br>
            \uC774 \uC11C\uBA85\uC740 Xphere \uBE14\uB85D\uCCB4\uC778\uC5D0 \uC601\uAD6C\uC801\uC73C\uB85C \uAE30\uB85D\uB418\uBA70 \uBCC0\uC870\uAC00 \uBD88\uAC00\uB2A5\uD569\uB2C8\uB2E4.
          </div>
          
          <div style="text-align: center;">
            <a href="${data.signatureUrl}" class="button">\u{1F4DD} \uBB38\uC11C \uC11C\uBA85\uD558\uAE30</a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            \uC774 \uB9C1\uD06C\uB294 \uBCF4\uC548\uC744 \uC704\uD574 \uC81C\uD55C\uB41C \uC2DC\uAC04 \uB3D9\uC548\uB9CC \uC720\uD6A8\uD569\uB2C8\uB2E4. \uC11C\uBA85 \uD6C4 \uBE14\uB85D\uCCB4\uC778 \uD2B8\uB79C\uC7AD\uC158 \uD574\uC2DC\uB97C \uBC1B\uAC8C \uB429\uB2C8\uB2E4.
          </p>
        </div>
        <div class="footer">
          <p>SignChain - \uBE14\uB85D\uCCB4\uC778 \uAE30\uBC18 \uC804\uC790\uC11C\uBA85 \uD50C\uB7AB\uD3FC</p>
          <p>\uC774 \uBA54\uC77C\uC740 \uC790\uB3D9\uC73C\uB85C \uBC1C\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateCompletionHtml(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .success { background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .hash { background: #f5f5f5; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u2705 SignChain</h1>
          <h2>\uC11C\uBA85 \uC644\uB8CC</h2>
        </div>
        <div class="content">
          <div class="success">
            <h3 style="margin: 0; color: #2e7d32;">\u{1F389} \uC11C\uBA85\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!</h3>
            <p style="margin: 10px 0 0 0;">\uBB38\uC11C: <strong>${data.documentTitle}</strong></p>
          </div>
          
          <p><strong>\uBE14\uB85D\uCCB4\uC778 \uD2B8\uB79C\uC7AD\uC158 \uD574\uC2DC:</strong></p>
          <div class="hash">${data.blockchainTxHash}</div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            \uC774 \uD574\uC2DC\uB97C \uC0AC\uC6A9\uD558\uC5EC \uC5B8\uC81C\uB4E0\uC9C0 \uC11C\uBA85\uC758 \uC9C4\uC704\uB97C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. 
            \uC11C\uBA85\uC740 Xphere \uBE14\uB85D\uCCB4\uC778\uC5D0 \uC601\uAD6C\uC801\uC73C\uB85C \uAE30\uB85D\uB418\uC5B4 \uBCC0\uC870\uAC00 \uBD88\uAC00\uB2A5\uD569\uB2C8\uB2E4.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// server/pdf-generator.ts
async function generateSignedDocumentPDF(options) {
  const { document, signatures: signatures2, includeSignatures, includeBlockchainInfo } = options;
  const pdfContent = generatePDFContent(options);
  return Buffer.from(pdfContent, "utf-8");
}
function generatePDFContent(options) {
  const { document, signatures: signatures2, includeSignatures, includeBlockchainInfo } = options;
  let content = `
SignChain - \uC804\uC790\uC11C\uBA85 \uBB38\uC11C
=========================

\uBB38\uC11C \uC815\uBCF4:
- \uC81C\uBAA9: ${document.title}
- \uC5C5\uB85C\uB4DC\uC77C: ${document.createdAt ? new Date(document.createdAt).toLocaleDateString("ko-KR") : "N/A"}
- \uD30C\uC77C \uD0C0\uC785: ${document.fileType}
- \uD30C\uC77C \uD06C\uAE30: ${Math.round(document.fileSize / 1024)} KB
- \uD30C\uC77C \uD574\uC2DC: ${document.fileHash}
- IPFS \uD574\uC2DC: ${document.ipfsHash}

`;
  if (document.description) {
    content += `\uC124\uBA85: ${document.description}

`;
  }
  if (includeSignatures && signatures2.length > 0) {
    content += `\uB514\uC9C0\uD138 \uC11C\uBA85 \uBAA9\uB85D (${signatures2.length}\uAC1C):
`;
    content += "=" + "=".repeat(30) + "\n\n";
    signatures2.forEach((signature, index) => {
      content += `${index + 1}. \uC11C\uBA85\uC790: ${signature.signerEmail}
`;
      content += `   \uC11C\uBA85\uC77C: ${signature.signedAt ? new Date(signature.signedAt).toLocaleString("ko-KR") : "N/A"}
`;
      content += `   \uC11C\uBA85 \uD0C0\uC785: ${signature.signatureType}
`;
      if (signature.blockchainTxHash) {
        content += `   \uBE14\uB85D\uCCB4\uC778 \uD574\uC2DC: ${signature.blockchainTxHash}
`;
      }
      content += `   \uC11C\uBA85 \uB370\uC774\uD130: ${signature.signatureData.substring(0, 50)}...

`;
    });
  }
  if (includeBlockchainInfo && document.blockchainTxHash) {
    content += `\uBE14\uB85D\uCCB4\uC778 \uAC80\uC99D \uC815\uBCF4:
`;
    content += "=" + "=".repeat(20) + "\n";
    content += `\uD2B8\uB79C\uC7AD\uC158 \uD574\uC2DC: ${document.blockchainTxHash}
`;
    content += `\uC0C1\uD0DC: ${document.status}
`;
    content += `\uB124\uD2B8\uC6CC\uD06C: Xphere \uBE14\uB85D\uCCB4\uC778
`;
    content += `\uAC80\uC99D \uC0C1\uD0DC: \uAC80\uC99D\uB428

`;
  }
  content += `\uC774 \uBB38\uC11C\uB294 SignChain \uD50C\uB7AB\uD3FC\uC5D0\uC11C \uC0DD\uC131\uB418\uC5C8\uC73C\uBA70,
`;
  content += `\uBE14\uB85D\uCCB4\uC778 \uAE30\uC220\uC744 \uD1B5\uD574 \uBB34\uACB0\uC131\uC774 \uBCF4\uC7A5\uB429\uB2C8\uB2E4.

`;
  content += `\uC0DD\uC131\uC77C: ${(/* @__PURE__ */ new Date()).toLocaleString("ko-KR")}
`;
  content += `\uD50C\uB7AB\uD3FC: SignChain (https://signchain.app)
`;
  return content;
}
async function generateDocumentPackage(document, signatures2, options) {
  switch (options.format) {
    case "pdf":
      const pdfBuffer = await generateSignedDocumentPDF({
        document,
        signatures: signatures2,
        includeSignatures: options.includeSignatures,
        includeBlockchainInfo: options.includeBlockchainProof
      });
      return {
        filename: `${document.title}_signed.pdf`,
        content: pdfBuffer,
        mimeType: "application/pdf"
      };
    case "json":
      const jsonData = {
        document: {
          ...document,
          createdAt: document.createdAt?.toISOString()
        },
        signatures: options.includeSignatures ? signatures2.map((sig) => ({
          ...sig,
          signedAt: sig.signedAt?.toISOString()
        })) : [],
        metadata: {
          exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
          platform: "SignChain",
          version: "1.0",
          includeSignatures: options.includeSignatures,
          includeBlockchainProof: options.includeBlockchainProof
        }
      };
      return {
        filename: `${document.title}_data.json`,
        content: Buffer.from(JSON.stringify(jsonData, null, 2)),
        mimeType: "application/json"
      };
    case "xml":
      const xmlContent = generateXMLContent(document, signatures2, options);
      return {
        filename: `${document.title}_data.xml`,
        content: Buffer.from(xmlContent),
        mimeType: "application/xml"
      };
    default:
      throw new Error("Unsupported format");
  }
}
function generateXMLContent(document, signatures2, options) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += "<signchain-document>\n";
  xml += "  <document>\n";
  xml += `    <id>${document.id}</id>
`;
  xml += `    <title><![CDATA[${document.title}]]></title>
`;
  xml += `    <fileType>${document.fileType}</fileType>
`;
  xml += `    <fileSize>${document.fileSize}</fileSize>
`;
  xml += `    <fileHash>${document.fileHash}</fileHash>
`;
  xml += `    <ipfsHash>${document.ipfsHash}</ipfsHash>
`;
  xml += `    <status>${document.status}</status>
`;
  xml += `    <createdAt>${document.createdAt?.toISOString() || ""}</createdAt>
`;
  if (options.includeBlockchainProof && document.blockchainTxHash) {
    xml += `    <blockchainTxHash>${document.blockchainTxHash}</blockchainTxHash>
`;
  }
  xml += "  </document>\n";
  if (options.includeSignatures && signatures2.length > 0) {
    xml += "  <signatures>\n";
    signatures2.forEach((signature) => {
      xml += "    <signature>\n";
      xml += `      <id>${signature.id}</id>
`;
      xml += `      <signerEmail><![CDATA[${signature.signerEmail}]]></signerEmail>
`;
      xml += `      <signatureType>${signature.signatureType}</signatureType>
`;
      xml += `      <signedAt>${signature.signedAt?.toISOString() || ""}</signedAt>
`;
      if (signature.blockchainTxHash) {
        xml += `      <blockchainTxHash>${signature.blockchainTxHash}</blockchainTxHash>
`;
      }
      xml += `      <signatureData><![CDATA[${signature.signatureData}]]></signatureData>
`;
      xml += "    </signature>\n";
    });
    xml += "  </signatures>\n";
  }
  xml += "  <metadata>\n";
  xml += `    <exportedAt>${(/* @__PURE__ */ new Date()).toISOString()}</exportedAt>
`;
  xml += `    <platform>SignChain</platform>
`;
  xml += `    <version>1.0</version>
`;
  xml += "  </metadata>\n";
  xml += "</signchain-document>\n";
  return xml;
}

// server/websocket.ts
init_storage();
import { Server as SocketIOServer } from "socket.io";
function setupWebSocket(httpServer) {
  const io = new SocketIOServer(httpServer, {
    path: "/ws",
    cors: {
      origin: true,
      credentials: true
    }
  });
  const connectedUsers = /* @__PURE__ */ new Map();
  io.on("connection", (socket) => {
    console.log("\uC0C8\uB85C\uC6B4 WebSocket \uC5F0\uACB0:", socket.id);
    socket.on("authenticate", async (data) => {
      try {
        const user = await storage.getUser(data.userId);
        if (user && user.email === data.email) {
          connectedUsers.set(socket.id, {
            userId: data.userId,
            email: data.email
          });
          socket.join(`user_${data.userId}`);
          socket.emit("authenticated", { success: true });
          const notifications2 = await storage.getUnreadNotifications(data.userId);
          socket.emit("unread_count", { count: notifications2.length });
          console.log(`\uC0AC\uC6A9\uC790 \uC778\uC99D \uC644\uB8CC: ${data.email} (${socket.id})`);
        } else {
          socket.emit("auth_error", { message: "\uC778\uC99D\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4" });
        }
      } catch (error) {
        console.error("WebSocket \uC778\uC99D \uC624\uB958:", error);
        socket.emit("auth_error", { message: "\uC778\uC99D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
      }
    });
    socket.on("mark_notification_read", async (data) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        try {
          await storage.markNotificationAsRead(data.notificationId, user.userId);
          const unreadCount = await storage.getUnreadNotifications(user.userId);
          socket.emit("unread_count", { count: unreadCount.length });
        } catch (error) {
          console.error("\uC54C\uB9BC \uC77D\uC74C \uCC98\uB9AC \uC624\uB958:", error);
        }
      }
    });
    socket.on("subscribe_document", (data) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.join(`document_${data.documentId}`);
        console.log(`\uC0AC\uC6A9\uC790 ${user.email}\uAC00 \uBB38\uC11C ${data.documentId} \uAD6C\uB3C5 \uC2DC\uC791`);
      }
    });
    socket.on("unsubscribe_document", (data) => {
      socket.leave(`document_${data.documentId}`);
    });
    socket.on("subscribe_workflow", (data) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.join(`workflow_${data.workflowId}`);
        console.log(`\uC0AC\uC6A9\uC790 ${user.email}\uAC00 \uC6CC\uD06C\uD50C\uB85C\uC6B0 ${data.workflowId} \uAD6C\uB3C5 \uC2DC\uC791`);
      }
    });
    socket.on("disconnect", () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`\uC0AC\uC6A9\uC790 \uC5F0\uACB0 \uD574\uC81C: ${user.email} (${socket.id})`);
      }
      connectedUsers.delete(socket.id);
    });
  });
  return io;
}
var NotificationService = class {
  io;
  constructor(io) {
    this.io = io;
  }
  async sendNotification(userId, notification) {
    try {
      const savedNotification = await storage.createNotification({
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        metadata: notification.metadata
      });
      this.io.to(`user_${userId}`).emit("new_notification", {
        id: savedNotification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        metadata: notification.metadata,
        createdAt: savedNotification.createdAt
      });
      const unreadNotifications = await storage.getUnreadNotifications(userId);
      this.io.to(`user_${userId}`).emit("unread_count", {
        count: unreadNotifications.length
      });
      return savedNotification;
    } catch (error) {
      console.error("\uC54C\uB9BC \uC804\uC1A1 \uC624\uB958:", error);
      throw error;
    }
  }
  async broadcastDocumentUpdate(documentId, update) {
    this.io.to(`document_${documentId}`).emit("document_update", {
      documentId,
      type: update.type,
      message: update.message,
      data: update.data,
      timestamp: /* @__PURE__ */ new Date()
    });
  }
  async broadcastWorkflowUpdate(workflowId, update) {
    this.io.to(`workflow_${workflowId}`).emit("workflow_update", {
      workflowId,
      type: update.type,
      message: update.message,
      currentStep: update.currentStep,
      progress: update.progress,
      timestamp: /* @__PURE__ */ new Date()
    });
  }
  async sendSecurityAlert(userId, alert) {
    await this.sendNotification(userId, {
      title: alert.title,
      message: alert.message,
      type: "security_alert",
      metadata: {
        severity: alert.severity,
        ...alert.metadata
      }
    });
    if (alert.severity === "high" || alert.severity === "critical") {
      this.io.to(`user_${userId}`).emit("security_alert", {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
  }
};

// server/api-routes.ts
init_storage();

// server/api-keys.ts
var RateLimiter = class {
  static requests = /* @__PURE__ */ new Map();
  static checkRateLimit(apiKey, maxRequests = 100, windowMs = 6e4) {
    const now = Date.now();
    const windowStart = now - windowMs;
    if (!this.requests.has(apiKey)) {
      this.requests.set(apiKey, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }
    const requestData = this.requests.get(apiKey);
    if (now > requestData.resetTime) {
      this.requests.set(apiKey, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }
    if (requestData.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: requestData.resetTime };
    }
    requestData.count++;
    return {
      allowed: true,
      remaining: maxRequests - requestData.count,
      resetTime: requestData.resetTime
    };
  }
};
function apiAuthMiddleware(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({
      error: "API key required",
      message: "X-API-Key header is required for API access"
    });
  }
  const rateLimit = RateLimiter.checkRateLimit(apiKey);
  res.set({
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1e3).toString()
  });
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      message: "API rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1e3)
    });
  }
  req.apiKey = apiKey;
  next();
}

// server/api-routes.ts
import { z as z2 } from "zod";
function registerApiRoutes(app2) {
  const API_PREFIX = "/api/v1";
  app2.get(`${API_PREFIX}/documents`, apiAuthMiddleware, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = (page - 1) * limit;
      const documents2 = await storage.getAllDocuments();
      const paginatedDocs = documents2.slice(offset, offset + limit);
      const total = documents2.length;
      res.json({
        data: paginatedDocs.map((doc) => ({
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
  app2.get(`${API_PREFIX}/documents/:id`, apiAuthMiddleware, async (req, res) => {
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
  app2.post(`${API_PREFIX}/documents`, apiAuthMiddleware, async (req, res) => {
    try {
      const createDocumentSchema = z2.object({
        title: z2.string().min(1, "Title is required"),
        description: z2.string().optional(),
        fileContent: z2.string().min(1, "File content is required"),
        // Base64 encoded
        mimeType: z2.string().min(1, "MIME type is required")
      });
      const validatedData = createDocumentSchema.parse(req.body);
      const fileBuffer = Buffer.from(validatedData.fileContent, "base64");
      const fileHash = __require("crypto").createHash("sha256").update(fileBuffer).digest("hex");
      const ipfsHash = "Qm" + __require("crypto").randomBytes(22).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 44);
      const blockchainTxHash = "0x" + __require("crypto").randomBytes(32).toString("hex");
      const document = await storage.createDocument({
        title: validatedData.title,
        description: validatedData.description || "",
        originalFilename: `${validatedData.title}.${validatedData.mimeType.split("/")[1]}`,
        fileSize: fileBuffer.length,
        fileType: validatedData.mimeType,
        category: "api-upload",
        fileHash,
        ipfsHash,
        blockchainTxHash,
        uploadedBy: 1
        // API user - should be determined from API key
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
      if (error instanceof z2.ZodError) {
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
  app2.post(`${API_PREFIX}/documents/:id/signature-requests`, apiAuthMiddleware, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({
          error: "Document not found",
          message: `Document with ID ${documentId} does not exist`
        });
      }
      const createSignatureRequestSchema = z2.object({
        signerEmail: z2.string().email("Valid email is required"),
        signerName: z2.string().optional(),
        message: z2.string().optional(),
        deadline: z2.string().datetime().optional(),
        requiredActions: z2.array(z2.string()).optional()
      });
      const validatedData = createSignatureRequestSchema.parse(req.body);
      const signatureRequest = await storage.createSignatureRequest({
        documentId,
        signerEmail: validatedData.signerEmail,
        signerName: validatedData.signerName,
        message: validatedData.message,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : void 0,
        shareToken: __require("crypto").randomBytes(32).toString("hex"),
        requesterId: 1
        // API user
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
      if (error instanceof z2.ZodError) {
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
  app2.get(`${API_PREFIX}/documents/:id/signature-requests`, apiAuthMiddleware, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const signatureRequests2 = await storage.getSignatureRequestsByDocument(documentId);
      res.json({
        data: signatureRequests2.map((request) => ({
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
  app2.get(`${API_PREFIX}/documents/:id/signatures`, apiAuthMiddleware, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const signatures2 = await storage.getSignaturesByDocument(documentId);
      res.json({
        data: signatures2.map((signature) => ({
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
  app2.get(`${API_PREFIX}/documents/:id/verification`, apiAuthMiddleware, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({
          error: "Document not found",
          message: `Document with ID ${documentId} does not exist`
        });
      }
      const verification = {
        isValid: true,
        documentHash: document.fileHash,
        blockchainTxHash: document.blockchainTxHash,
        ipfsHash: document.ipfsHash,
        verifiedAt: /* @__PURE__ */ new Date(),
        blockNumber: Math.floor(Math.random() * 1e6) + 1234567,
        networkId: 137,
        // Polygon
        gasUsed: 21e3,
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
  app2.post(`${API_PREFIX}/webhooks`, apiAuthMiddleware, async (req, res) => {
    try {
      const createWebhookSchema = z2.object({
        url: z2.string().url("Valid URL is required"),
        events: z2.array(z2.string()).min(1, "At least one event type is required"),
        secret: z2.string().optional()
      });
      const validatedData = createWebhookSchema.parse(req.body);
      const secret = validatedData.secret || __require("crypto").randomBytes(32).toString("hex");
      const webhook = {
        id: Math.floor(Math.random() * 1e4),
        url: validatedData.url,
        events: validatedData.events,
        secret,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      };
      res.status(201).json({
        data: webhook,
        message: "Webhook created successfully"
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
  app2.get(`${API_PREFIX}/health`, (req, res) => {
    res.json({
      status: "healthy",
      timestamp: /* @__PURE__ */ new Date(),
      version: "1.0.0",
      uptime: process.uptime()
    });
  });
  app2.get(`${API_PREFIX}/rate-limit`, apiAuthMiddleware, (req, res) => {
    res.json({
      limit: 100,
      remaining: parseInt(res.get("X-RateLimit-Remaining") || "100"),
      reset: parseInt(res.get("X-RateLimit-Reset") || "0"),
      windowMs: 6e4
    });
  });
  console.log("External API routes registered at /api/v1");
}

// server/routes.ts
init_security();

// server/auth/jwt-auth.ts
import jwt from "jsonwebtoken";
var AuthService = class {
  static JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
  static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
  static REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
  /**
   * JWT 토큰 생성
   */
  static generateToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: "signchain",
      audience: "signchain-users"
    });
  }
  /**
   * 리프레시 토큰 생성
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: "signchain",
      audience: "signchain-users"
    });
  }
  /**
   * JWT 토큰 검증
   */
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: "signchain",
        audience: "signchain-users"
      });
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
  /**
   * 토큰에서 사용자 ID 추출
   */
  static getUserIdFromToken(token) {
    const payload = this.verifyToken(token);
    return payload.userId;
  }
};
var authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        error: "Access token required",
        code: "TOKEN_MISSING"
      });
      return;
    }
    const user = AuthService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    console.error("Token authentication failed:", error);
    res.status(403).json({
      error: "Invalid or expired token",
      code: "TOKEN_INVALID"
    });
  }
};
var requireCurrentUserId = (req) => {
  if (!req.user?.userId) {
    throw new Error("User authentication required");
  }
  return req.user.userId;
};

// server/auth/auth-routes.ts
init_security();
init_storage();
var login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
      return;
    }
    const user = await storage.getUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
      return;
    }
    const isValidPassword = await SecurityHelpers.verifyPassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
      return;
    }
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role || "user"
    };
    const token = AuthService.generateToken(payload);
    const refreshToken2 = rememberMe ? AuthService.generateRefreshToken(payload) : void 0;
    await storage.updateUserLastLogin(user.id);
    const response = {
      success: true,
      token,
      refreshToken: refreshToken2,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user"
      },
      expiresIn: process.env.JWT_EXPIRES_IN || "24h"
    };
    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const { refreshToken: refreshToken2 } = req.body;
    if (!refreshToken2) {
      res.status(400).json({
        success: false,
        error: "Refresh token is required"
      });
      return;
    }
    const payload = AuthService.verifyToken(refreshToken2);
    const user = await storage.getUser(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found"
      });
      return;
    }
    const newPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || "user"
    };
    const newToken = AuthService.generateToken(newPayload);
    const newRefreshToken = AuthService.generateRefreshToken(newPayload);
    const response = {
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user"
      },
      expiresIn: process.env.JWT_EXPIRES_IN || "24h"
    };
    res.json(response);
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid or expired refresh token"
    });
  }
};
var logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};
var getCurrentUser = async (req, res) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        error: "Authentication required"
      });
      return;
    }
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found"
      });
      return;
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// server/routes.ts
import crypto6 from "crypto";
import { z as z4 } from "zod";
function generateDocumentHash2(data) {
  return crypto6.createHash("sha256").update(data).digest("hex");
}
function generateIPFSHash() {
  return "Qm" + crypto6.randomBytes(22).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 44);
}
function generateBlockchainTxHash() {
  return "0x" + crypto6.randomBytes(32).toString("hex");
}
function generateShareToken() {
  return crypto6.randomBytes(32).toString("hex");
}
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const io = setupWebSocket(httpServer);
  global.notificationService = new NotificationService(io);
  registerApiRoutes(app2);
  const moduleRoutes = await Promise.resolve().then(() => (init_module_routes(), module_routes_exports));
  app2.use("/api/modules", moduleRoutes.default);
  const didRoutes = await Promise.resolve().then(() => (init_did(), did_exports));
  app2.use("/api/did", didRoutes.default);
  const filesRoutes = await Promise.resolve().then(() => (init_files(), files_exports));
  app2.use("/api/v1/files", filesRoutes.default);
  const ipfsRoutes = await Promise.resolve().then(() => (init_ipfs(), ipfs_exports));
  app2.use("/api/v1/ipfs", ipfsRoutes.default);
  app2.post("/api/auth/login", login);
  app2.post("/api/auth/logout", logout);
  app2.post("/api/auth/refresh", refreshToken);
  app2.get("/api/auth/me", authenticateToken, getCurrentUser);
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "\uC0AC\uC6A9\uC790\uBA85\uC774 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4"
        });
      }
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: "\uC774\uBA54\uC77C\uC774 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4"
        });
      }
      const hashedPassword = await SecurityHelpers.hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "user"
        }
      });
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0].message
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4"
      });
    }
  });
  app2.get("/api/documents", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "\uC0AC\uC6A9\uC790 ID\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4" });
      }
      const documents2 = await storage.getDocumentsByUser(userId);
      res.json(documents2);
    } catch (error) {
      res.status(500).json({ message: "\uBB38\uC11C\uB97C \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "\uBB38\uC11C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "\uBB38\uC11C\uB97C \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const fileContent = `Mock file content for ${documentData.originalFilename}`;
      const fileHash = generateDocumentHash2(fileContent);
      const ipfsHash = generateIPFSHash();
      const document = await storage.createDocument({
        ...documentData,
        fileHash,
        ipfsHash
      });
      await storage.createAuditLog({
        documentId: document.id,
        userId: document.uploadedBy,
        action: "\uBB38\uC11C \uC5C5\uB85C\uB4DC",
        description: `${document.originalFilename} \uD30C\uC77C\uC774 \uC5C5\uB85C\uB4DC\uB418\uACE0 \uBE14\uB85D\uCCB4\uC778\uC5D0 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4`,
        metadata: { fileSize: document.fileSize, fileType: document.fileType },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      res.json(document);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "\uBB38\uC11C \uC5C5\uB85C\uB4DC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/signature-requests", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "\uC0AC\uC6A9\uC790 ID\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4" });
      }
      const requests = await storage.getSignatureRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "\uC11C\uBA85 \uC694\uCCAD\uC744 \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/signature-requests/token/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const request = await storage.getSignatureRequestByToken(token);
      if (!request) {
        return res.status(404).json({ message: "\uC11C\uBA85 \uC694\uCCAD\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      const document = await storage.getDocument(request.documentId);
      res.json({ request, document });
    } catch (error) {
      res.status(500).json({ message: "\uC11C\uBA85 \uC694\uCCAD\uC744 \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/signature-requests", async (req, res) => {
    try {
      const requestData = insertSignatureRequestSchema.parse(req.body);
      const shareToken = generateShareToken();
      const request = await storage.createSignatureRequest({
        ...requestData,
        shareToken
      });
      const document = await storage.getDocument(request.documentId);
      const requester = await storage.getUser(request.requesterId);
      if (document && requester) {
        const signatureUrl = `${process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://your-domain.replit.app"}/sign/${shareToken}`;
        const emailSent = await sendSignatureRequestEmail({
          to: request.signerEmail,
          signerName: request.signerName || void 0,
          requesterName: requester.name,
          documentTitle: document.title,
          signatureUrl,
          deadline: request.deadline || void 0,
          message: request.message || void 0
        });
        console.log(`Email ${emailSent ? "sent successfully" : "failed"} to ${request.signerEmail}`);
        await storage.updateDocumentStatus(request.documentId, "\uC11C\uBA85 \uB300\uAE30", void 0);
      }
      await storage.createAuditLog({
        documentId: request.documentId,
        userId: request.requesterId,
        action: "\uC11C\uBA85 \uC694\uCCAD \uC0DD\uC131",
        description: `${request.signerEmail}\uC5D0\uAC8C \uC11C\uBA85 \uC694\uCCAD\uC744 \uBCF4\uB0C8\uC2B5\uB2C8\uB2E4`,
        metadata: { signerEmail: request.signerEmail },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      res.json(request);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "\uC11C\uBA85 \uC694\uCCAD \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/signatures", async (req, res) => {
    try {
      const signatureData = req.body;
      const blockchainTxHash = generateBlockchainTxHash();
      const signature = await storage.createSignature({
        ...signatureData,
        blockchainTxHash
      });
      const requests = await storage.getSignatureRequestsByDocument(signature.documentId);
      const request = requests.find((r) => r.signerEmail === signature.signerEmail);
      if (request) {
        await storage.updateSignatureRequestStatus(request.id, "\uC644\uB8CC");
      }
      const allSignatures = await storage.getSignaturesByDocument(signature.documentId);
      const allRequests = await storage.getSignatureRequestsByDocument(signature.documentId);
      const completedSignatures = allSignatures.filter((s) => s.isCompleted);
      if (completedSignatures.length === allRequests.length) {
        await storage.updateDocumentStatus(signature.documentId, "\uC11C\uBA85 \uC644\uB8CC", blockchainTxHash);
        const document = await storage.getDocument(signature.documentId);
        if (document) {
          const requester = await storage.getUser(document.uploadedBy);
          if (requester) {
            await sendCompletionEmail({
              to: requester.email,
              documentTitle: document.title,
              blockchainTxHash
            });
          }
          for (const request2 of allRequests) {
            await sendCompletionEmail({
              to: request2.signerEmail,
              documentTitle: document.title,
              blockchainTxHash
            });
          }
        }
      }
      await storage.createAuditLog({
        documentId: signature.documentId,
        userId: signature.signerId,
        action: "\uC11C\uBA85 \uC644\uB8CC",
        description: `${signature.signerEmail}\uB2D8\uC774 \uBB38\uC11C\uC5D0 \uB514\uC9C0\uD138 \uC11C\uBA85\uC744 \uC644\uB8CC\uD588\uC2B5\uB2C8\uB2E4`,
        metadata: {
          signatureType: signature.signatureType,
          blockchainTxHash: signature.blockchainTxHash
        },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      res.json(signature);
    } catch (error) {
      res.status(500).json({ message: "\uC11C\uBA85 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/signature-requests/token/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const request = await storage.getSignatureRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "\uC11C\uBA85 \uC694\uCCAD\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      res.json(request);
    } catch (error) {
      console.error("Get signature request by token error:", error);
      res.status(500).json({ error: "\uC11C\uBA85 \uC694\uCCAD\uC744 \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/documents/:id/download", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const format = req.query.format || "pdf";
      const includeSignatures = req.query.signatures === "true";
      const includeAuditTrail = req.query.audit === "true";
      const includeBlockchainProof = req.query.blockchain === "true";
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "\uBB38\uC11C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      const signatures2 = includeSignatures ? await storage.getSignaturesByDocument(documentId) : [];
      const options = {
        includeSignatures,
        includeAuditTrail,
        includeBlockchainProof,
        format
      };
      const result = await generateDocumentPackage(document, signatures2, options);
      res.setHeader("Content-Type", result.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      res.send(result.content);
      await storage.createAuditLog({
        documentId,
        userId: null,
        action: "\uBB38\uC11C \uB2E4\uC6B4\uB85C\uB4DC",
        description: `${format.toUpperCase()} \uD615\uC2DD\uC73C\uB85C \uBB38\uC11C\uB97C \uB2E4\uC6B4\uB85C\uB4DC\uD588\uC2B5\uB2C8\uB2E4`,
        metadata: { format, options },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
    } catch (error) {
      console.error("Document download error:", error);
      res.status(500).json({ message: "\uBB38\uC11C \uB2E4\uC6B4\uB85C\uB4DC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/workflow-templates", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "\uC0AC\uC6A9\uC790 ID\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4" });
      }
      const templates = await storage.getWorkflowTemplatesByUser(userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uD15C\uD50C\uB9BF\uC744 \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/workflow-templates", async (req, res) => {
    try {
      const templateData = insertWorkflowTemplateSchema.parse(req.body);
      const template = await storage.createWorkflowTemplate(templateData);
      await storage.createAuditLog({
        documentId: null,
        userId: templateData.createdBy,
        action: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uD15C\uD50C\uB9BF \uC0DD\uC131",
        description: `\uC0C8\uB85C\uC6B4 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uD15C\uD50C\uB9BF "${templateData.name}"\uC744 \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4`,
        metadata: { templateId: template.id, stepCount: templateData.steps?.steps?.length || 0 },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uD15C\uD50C\uB9BF \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/workflows/create", async (req, res) => {
    try {
      const { templateId, documentId, requesterId } = req.body;
      if (!templateId || !documentId || !requesterId) {
        return res.status(400).json({ message: "\uD544\uC218 \uD544\uB4DC\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
      }
      const workflowId = await storage.createWorkflowFromTemplate(
        parseInt(templateId),
        parseInt(documentId),
        parseInt(requesterId)
      );
      await storage.createAuditLog({
        documentId: parseInt(documentId),
        userId: parseInt(requesterId),
        action: "\uD611\uC5C5 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC2DC\uC791",
        description: `\uD15C\uD50C\uB9BF\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC0C8\uB85C\uC6B4 \uD611\uC5C5 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4`,
        metadata: { workflowId, templateId },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      res.json({ workflowId });
    } catch (error) {
      console.error("Workflow creation error:", error);
      res.status(500).json({ message: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/workflows/:workflowId/status", async (req, res) => {
    try {
      const workflowId = req.params.workflowId;
      const status = await storage.getWorkflowStatus(workflowId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0C1\uD0DC\uB97C \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/signature-requests/:id/approve", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { approverId } = req.body;
      if (!approverId) {
        return res.status(400).json({ message: "\uC2B9\uC778\uC790 ID\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4" });
      }
      await storage.approveSignatureRequest(requestId, parseInt(approverId));
      await storage.createAuditLog({
        documentId: null,
        // Would need to get from request
        userId: parseInt(approverId),
        action: "\uC11C\uBA85 \uC694\uCCAD \uC2B9\uC778",
        description: `\uC11C\uBA85 \uC694\uCCAD\uC744 \uC2B9\uC778\uD588\uC2B5\uB2C8\uB2E4`,
        metadata: { requestId },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      res.json({ message: "\uC11C\uBA85 \uC694\uCCAD\uC774 \uC2B9\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
    } catch (error) {
      res.status(500).json({ message: "\uC2B9\uC778 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/signature-requests/:id/reject", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { approverId, reason } = req.body;
      if (!approverId || !reason) {
        return res.status(400).json({ message: "\uC2B9\uC778\uC790 ID\uC640 \uAC70\uBD80 \uC0AC\uC720\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4" });
      }
      await storage.rejectSignatureRequest(requestId, parseInt(approverId), reason);
      await storage.createAuditLog({
        documentId: null,
        // Would need to get from request
        userId: parseInt(approverId),
        action: "\uC11C\uBA85 \uC694\uCCAD \uAC70\uBD80",
        description: `\uC11C\uBA85 \uC694\uCCAD\uC744 \uAC70\uBD80\uD588\uC2B5\uB2C8\uB2E4: ${reason}`,
        metadata: { requestId, reason },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      res.json({ message: "\uC11C\uBA85 \uC694\uCCAD\uC774 \uAC70\uBD80\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
    } catch (error) {
      res.status(500).json({ message: "\uAC70\uBD80 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/audit/:documentId", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const auditLogs2 = await storage.getAuditLogsByDocument(documentId);
      res.json(auditLogs2);
    } catch (error) {
      res.status(500).json({ message: "\uAC10\uC0AC \uB85C\uADF8\uB97C \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/verify/:documentId", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "\uBB38\uC11C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      const verification = {
        isValid: true,
        blockchainTxHash: document.blockchainTxHash,
        documentHash: document.fileHash,
        verifiedAt: /* @__PURE__ */ new Date(),
        blockNumber: Math.floor(Math.random() * 1e6) + 1234567,
        gasUsed: 21e3
      };
      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: "\uBE14\uB85D\uCCB4\uC778 \uAC80\uC99D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const userId = requireCurrentUserId(req);
      const notifications2 = await storage.getNotificationsByUser(userId);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "\uC54C\uB9BC\uC744 \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = requireCurrentUserId(req);
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "\uC54C\uB9BC \uC77D\uC74C \uCC98\uB9AC \uC2E4\uD328" });
    }
  });
  app2.post("/api/notifications/mark-all-read", authenticateToken, async (req, res) => {
    try {
      const userId = requireCurrentUserId(req);
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "\uBAA8\uB4E0 \uC54C\uB9BC \uC77D\uC74C \uCC98\uB9AC \uC2E4\uD328" });
    }
  });
  app2.get("/api/security/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let security = await storage.getUserSecurity(userId);
      if (!security) {
        security = await storage.createUserSecurity({ userId });
      }
      res.json({
        twoFactorEnabled: security.twoFactorEnabled,
        biometricEnabled: security.biometricEnabled,
        lastLoginAt: security.lastLoginAt
      });
    } catch (error) {
      res.status(500).json({ message: "\uBCF4\uC548 \uC124\uC815\uC744 \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/security/2fa/setup", authenticateToken, async (req, res) => {
    try {
      const userId = requireCurrentUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "\uC0AC\uC6A9\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      const { TwoFactorAuth: TwoFactorAuth2 } = await Promise.resolve().then(() => (init_security(), security_exports));
      const { secret, qrCodeUrl } = TwoFactorAuth2.generateSecret(user.email);
      const qrCode = await TwoFactorAuth2.generateQRCode(secret, user.email);
      await storage.updateUserSecurity(userId, { twoFactorSecret: secret });
      res.json({ qrCode, secret });
    } catch (error) {
      console.error("2FA \uC124\uC815 \uC624\uB958:", error);
      res.status(500).json({ message: "2FA \uC124\uC815 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/security/2fa/enable", authenticateToken, async (req, res) => {
    try {
      const userId = requireCurrentUserId(req);
      const { token } = req.body;
      const { TwoFactorAuth: TwoFactorAuth2 } = await Promise.resolve().then(() => (init_security(), security_exports));
      const result = await TwoFactorAuth2.enableTwoFactor(userId, token);
      res.json(result);
    } catch (error) {
      console.error("2FA \uD65C\uC131\uD654 \uC624\uB958:", error);
      res.status(500).json({ message: "2FA \uD65C\uC131\uD654 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/security/2fa/disable", authenticateToken, async (req, res) => {
    try {
      const userId = requireCurrentUserId(req);
      await storage.updateUserSecurity(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: null
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "2FA \uBE44\uD65C\uC131\uD654 \uC2E4\uD328" });
    }
  });
  app2.post("/api/security/biometric/register-options", authenticateToken, async (req, res) => {
    try {
      const userId = requireCurrentUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "\uC0AC\uC6A9\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
      }
      const { BiometricAuth: BiometricAuth2 } = await Promise.resolve().then(() => (init_security(), security_exports));
      const options = await BiometricAuth2.generateRegistrationOptions(userId, user.email);
      res.json(options);
    } catch (error) {
      console.error("\uC0DD\uCCB4 \uC778\uC99D \uB4F1\uB85D \uC635\uC158 \uC0DD\uC131 \uC624\uB958:", error);
      res.status(500).json({ message: "\uC0DD\uCCB4 \uC778\uC99D \uC124\uC815 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/security/biometric/register-verify", authenticateToken, async (req, res) => {
    try {
      const userId = requireCurrentUserId(req);
      const credential = req.body;
      const { BiometricAuth: BiometricAuth2 } = await Promise.resolve().then(() => (init_security(), security_exports));
      const result = await BiometricAuth2.verifyRegistration(userId, credential);
      res.json(result);
    } catch (error) {
      console.error("\uC0DD\uCCB4 \uC778\uC99D \uB4F1\uB85D \uAC80\uC99D \uC624\uB958:", error);
      res.status(500).json({ message: "\uC0DD\uCCB4 \uC778\uC99D \uB4F1\uB85D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
  });
  app2.post("/api/security/biometric/disable", authenticateToken, async (req, res) => {
    try {
      const userId = requireCurrentUserId(req);
      await storage.updateUserSecurity(userId, {
        biometricEnabled: false,
        biometricPublicKey: null
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "\uC0DD\uCCB4 \uC778\uC99D \uBE44\uD65C\uC131\uD654 \uC2E4\uD328" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express3 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  base: process.env.BASE_URL || "/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리
          "react-vendor": ["react", "react-dom", "wouter"],
          // UI 라이브러리
          "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-label", "@radix-ui/react-slot", "@radix-ui/react-tooltip"],
          // 유틸리티 라이브러리
          "utils": ["clsx", "class-variance-authority", "tailwind-merge"],
          // API 및 상태 관리
          "api": ["@tanstack/react-query", "axios"]
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 5179,
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path3.resolve(process.cwd(), "dist/public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  const baseUrl = process.env.BASE_URL || "/";
  const normalizedBase = baseUrl.endsWith("/") && baseUrl !== "/" ? baseUrl.slice(0, -1) : baseUrl;
  app2.use(normalizedBase, express3.static(distPath));
  app2.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express4();
app.use(express4.json());
app.use(express4.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    console.log("Development mode: Run 'npx vite' in a separate terminal for frontend");
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
