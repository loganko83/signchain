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
  status: text("status").notNull().default("대기"),
  shareToken: text("share_token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
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
export type AuditLog = typeof auditLogs.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
