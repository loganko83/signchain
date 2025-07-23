import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  category: true,
  priority: true,
  originalFilename: true,
  fileType: true,
  fileSize: true,
  uploadedBy: true,
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
export type AuditLog = typeof auditLogs.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
