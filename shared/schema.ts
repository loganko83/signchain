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
export type AuditLog = typeof auditLogs.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
