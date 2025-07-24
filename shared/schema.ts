import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Module types enum
export const moduleTypeEnum = pgEnum("module_type", ["contract", "approval", "did"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  moduleType: moduleTypeEnum("module_type").notNull().default("contract"),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("보통"),
  originalFilename: text("original_filename").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileHash: text("file_hash").notNull(),
  ipfsHash: text("ipfs_hash").notNull(),
  blockchainTxHash: text("blockchain_tx_hash"),
  status: text("status").notNull().default("업로드됨"),
  uploadedBy: integer("uploaded_by").notNull(),
  organizationId: integer("organization_id"), // For enterprise accounts
  createdAt: timestamp("created_at").defaultNow(),
});

export const signatures = pgTable("signatures", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  signerId: integer("signer_id").notNull(),
  signerEmail: text("signer_email").notNull(),
  signatureData: text("signature_data").notNull(),
  signatureType: text("signature_type").notNull(),
  signedAt: timestamp("signed_at").defaultNow(),
  blockchainTxHash: text("blockchain_tx_hash"),
  isCompleted: boolean("is_completed").default(false),
});

export const signatureRequests = pgTable("signature_requests", {
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
  status: text("status").notNull().default("대기"),
  shareToken: text("share_token").notNull().unique(),
  workflowId: text("workflow_id"), // Groups related signature requests
  approvalRequired: boolean("approval_required").default(false).notNull(),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectedBy: integer("rejected_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for workflow templates
export const workflowTemplates = pgTable("workflow_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  steps: jsonb("steps").notNull(), // Array of workflow steps
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for document collaborators
export const documentCollaborators = pgTable("document_collaborators", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  userId: integer("user_id"),
  email: text("email").notNull(),
  name: text("name"),
  role: text("role").notNull(), // 'signer', 'reviewer', 'approver', 'viewer'
  permissions: jsonb("permissions"), // Custom permissions object
  addedBy: integer("added_by").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// New table for real-time notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'signature_request', 'signature_completed', 'workflow_update', 'security_alert'
  isRead: boolean("is_read").default(false).notNull(),
  metadata: jsonb("metadata"), // Additional data for the notification
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced users table for security features
export const userSecurity = pgTable("user_security", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  twoFactorSecret: text("two_factor_secret"),
  biometricEnabled: boolean("biometric_enabled").default(false).notNull(),
  biometricPublicKey: text("biometric_public_key"),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blockchain transactions table
export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  signatureId: integer("signature_id"),
  transactionHash: text("transaction_hash").notNull().unique(),
  blockNumber: integer("block_number"),
  networkId: integer("network_id").notNull(), // 1=Ethereum, 137=Polygon, etc.
  gasUsed: text("gas_used"),
  gasFee: text("gas_fee"),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'failed'
  contractAddress: text("contract_address"),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// Organizations table
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain"),
  settings: jsonb("settings"), // Organization-wide settings
  subscriptionTier: text("subscription_tier").default("basic").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Organization members table
export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // 'admin', 'manager', 'member'
  permissions: jsonb("permissions"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// API Keys table for external integrations
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id"),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  lastUsed: timestamp("last_used"),
  permissions: jsonb("permissions"), // Array of allowed operations
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhooks table for event notifications
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id"),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: jsonb("events").notNull(), // Array of event types to subscribe to
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggered: timestamp("last_triggered"),
  failureCount: integer("failure_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Approval workflows table (for approval module)
export const approvalWorkflows = pgTable("approval_workflows", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  workflowName: text("workflow_name").notNull(),
  organizationId: integer("organization_id").notNull(),
  initiatedBy: integer("initiated_by").notNull(),
  currentStep: integer("current_step").default(1).notNull(),
  totalSteps: integer("total_steps").notNull(),
  status: text("status").default("진행중").notNull(), // 진행중, 완료, 거부, 보류
  blockchainTxHash: text("blockchain_tx_hash"), // Transaction for workflow creation
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"), // Workflow configuration
  createdAt: timestamp("created_at").defaultNow(),
});

// Approval steps table
export const approvalSteps = pgTable("approval_steps", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  assignedTo: integer("assigned_to"), // User ID
  assignedRole: text("assigned_role"), // Role name for dynamic assignment
  stepType: text("step_type").notNull(), // 서명, 검토, 승인
  status: text("status").default("대기").notNull(), // 대기, 완료, 거부, 건너뜀
  completedBy: integer("completed_by"),
  completedAt: timestamp("completed_at"),
  comments: text("comments"),
  blockchainTxHash: text("blockchain_tx_hash"), // Transaction for each step completion
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
});

// DID Credentials table (for DID module)
export const didCredentials = pgTable("did_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  credentialType: text("credential_type").notNull(), // 사업자등록증, 주민증, 여권
  credentialId: text("credential_id").notNull().unique(), // DID identifier
  issuer: text("issuer").notNull(), // Issuing authority
  subject: jsonb("subject").notNull(), // Credential data (encrypted)
  proof: jsonb("proof").notNull(), // Cryptographic proof
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  blockchainTxHash: text("blockchain_tx_hash").notNull(), // Blockchain registration
  verificationKey: text("verification_key").notNull(),
  status: text("status").default("활성").notNull(), // 활성, 만료, 폐기
  metadata: jsonb("metadata"), // Additional credential metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// DID Verification records
export const didVerifications = pgTable("did_verifications", {
  id: serial("id").primaryKey(),
  credentialId: text("credential_id").notNull(),
  verifierId: integer("verifier_id").notNull(),
  verificationResult: boolean("verification_result").notNull(),
  verificationMethod: text("verification_method").notNull(), // 블록체인, QR코드, API
  blockchainTxHash: text("blockchain_tx_hash"), // Transaction for verification record
  metadata: jsonb("metadata"), // Verification details
  verifiedAt: timestamp("verified_at").defaultNow(),
});

// Enterprise user roles for approval workflows
export const enterpriseRoles = pgTable("enterprise_roles", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  roleName: text("role_name").notNull(),
  permissions: jsonb("permissions").notNull(), // Array of permissions
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User role assignments
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roleId: integer("role_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  assignedBy: integer("assigned_by").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
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
  organizationId: true,
});

export const insertApprovalWorkflowSchema = createInsertSchema(approvalWorkflows).pick({
  documentId: true,
  workflowName: true,
  organizationId: true,
  initiatedBy: true,
  totalSteps: true,
  metadata: true,
});

export const insertApprovalStepSchema = createInsertSchema(approvalSteps).pick({
  workflowId: true,
  stepNumber: true,
  assignedTo: true,
  assignedRole: true,
  stepType: true,
  deadline: true,
});

export const insertDidCredentialSchema = createInsertSchema(didCredentials).pick({
  userId: true,
  credentialType: true,
  credentialId: true,
  issuer: true,
  subject: true,
  proof: true,
  expiresAt: true,
  verificationKey: true,
  metadata: true,
});

export const insertDidVerificationSchema = createInsertSchema(didVerifications).pick({
  credentialId: true,
  verifierId: true,
  verificationResult: true,
  verificationMethod: true,
  metadata: true,
});

export const insertEnterpriseRoleSchema = createInsertSchema(enterpriseRoles).pick({
  organizationId: true,
  roleName: true,
  permissions: true,
  description: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).pick({
  userId: true,
  roleId: true,
  organizationId: true,
  assignedBy: true,
});

export const insertSignatureSchema = createInsertSchema(signatures).pick({
  documentId: true,
  signerId: true,
  signerEmail: true,
  signatureData: true,
  signatureType: true,
});

export const insertSignatureRequestSchema = createInsertSchema(signatureRequests).pick({
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
  approvalRequired: true,
});

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates).pick({
  name: true,
  description: true,
  createdBy: true,
  steps: true,
});

export const insertDocumentCollaboratorSchema = createInsertSchema(documentCollaborators).pick({
  documentId: true,
  userId: true,
  email: true,
  name: true,
  role: true,
  permissions: true,
  addedBy: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  metadata: true,
});

export const insertUserSecuritySchema = createInsertSchema(userSecurity).pick({
  userId: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
  biometricEnabled: true,
  biometricPublicKey: true,
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).pick({
  documentId: true,
  signatureId: true,
  transactionHash: true,
  networkId: true,
  contractAddress: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
  domain: true,
  settings: true,
  subscriptionTier: true,
  createdBy: true,
});

export const insertOrganizationMemberSchema = createInsertSchema(organizationMembers).pick({
  organizationId: true,
  userId: true,
  role: true,
  permissions: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  userId: true,
  organizationId: true,
  name: true,
  keyHash: true,
  permissions: true,
  expiresAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).pick({
  userId: true,
  organizationId: true,
  url: true,
  secret: true,
  events: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "사용자명을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;
export type InsertSignatureRequest = z.infer<typeof insertSignatureRequestSchema>;
export type SignatureRequest = typeof signatureRequests.$inferSelect;
export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertDocumentCollaborator = z.infer<typeof insertDocumentCollaboratorSchema>;
export type DocumentCollaborator = typeof documentCollaborators.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertUserSecurity = z.infer<typeof insertUserSecuritySchema>;
export type UserSecurity = typeof userSecurity.$inferSelect;
export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganizationMember = z.infer<typeof insertOrganizationMemberSchema>;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertApprovalWorkflow = z.infer<typeof insertApprovalWorkflowSchema>;
export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type InsertApprovalStep = z.infer<typeof insertApprovalStepSchema>;
export type ApprovalStep = typeof approvalSteps.$inferSelect;
export type InsertDidCredential = z.infer<typeof insertDidCredentialSchema>;
export type DidCredential = typeof didCredentials.$inferSelect;
export type InsertDidVerification = z.infer<typeof insertDidVerificationSchema>;
export type DidVerification = typeof didVerifications.$inferSelect;
export type InsertEnterpriseRole = z.infer<typeof insertEnterpriseRoleSchema>;
export type EnterpriseRole = typeof enterpriseRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
