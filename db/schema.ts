import { pgTable, text, timestamp, integer, boolean, varchar, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';

// Users table
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Files metadata table for IPFS storage
export const files = pgTable('files', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  ipfsHash: text('ipfs_hash').notNull().unique(),
  uploadedBy: text('uploaded_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  metadata: json('metadata'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contracts table
export const contracts = pgTable('contracts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content').notNull(),
  templateId: text('template_id'),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  contractAddress: text('contract_address'), // Blockchain contract address
  ipfsHash: text('ipfs_hash'), // IPFS hash for contract document
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contract participants
export const contractParticipants = pgTable('contract_participants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  contractId: text('contract_id')
    .notNull()
    .references(() => contracts.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(), // 'creator', 'signer', 'witness'
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  signedAt: timestamp('signed_at'),
  signatureData: text('signature_data'), // Digital signature data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Approval workflows
export const approvals = pgTable('approvals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  requestedBy: text('requested_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  documentId: text('document_id')
    .references(() => files.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Approval steps (approval workflow)
export const approvalSteps = pgTable('approval_steps', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  approvalId: text('approval_id')
    .notNull()
    .references(() => approvals.id, { onDelete: 'cascade' }),
  stepOrder: integer('step_order').notNull(),
  approverId: text('approver_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  comments: text('comments'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// DID (Decentralized Identity) records
export const didRecords = pgTable('did_records', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  didIdentifier: text('did_identifier').notNull().unique(),
  publicKey: text('public_key').notNull(),
  privateKeyEncrypted: text('private_key_encrypted'), // Encrypted private key
  didDocument: json('did_document').notNull(),
  verificationMethods: json('verification_methods'),
  services: json('services'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Verifiable credentials
export const credentials = pgTable('credentials', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  holderId: text('holder_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  issuerId: text('issuer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  credentialType: varchar('credential_type', { length: 100 }).notNull(),
  credentialData: json('credential_data').notNull(),
  proof: json('proof'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  ipfsHash: text('ipfs_hash'), // IPFS hash for credential document
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertFileSchema = createInsertSchema(files);
export const selectFileSchema = createSelectSchema(files);

export const insertContractSchema = createInsertSchema(contracts);
export const selectContractSchema = createSelectSchema(contracts);

export const insertContractParticipantSchema = createInsertSchema(contractParticipants);
export const selectContractParticipantSchema = createSelectSchema(contractParticipants);

export const insertApprovalSchema = createInsertSchema(approvals);
export const selectApprovalSchema = createSelectSchema(approvals);

export const insertApprovalStepSchema = createInsertSchema(approvalSteps);
export const selectApprovalStepSchema = createSelectSchema(approvalSteps);

export const insertDidRecordSchema = createInsertSchema(didRecords);
export const selectDidRecordSchema = createSelectSchema(didRecords);

export const insertCredentialSchema = createInsertSchema(credentials);
export const selectCredentialSchema = createSelectSchema(credentials);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;

export type ContractParticipant = typeof contractParticipants.$inferSelect;
export type NewContractParticipant = typeof contractParticipants.$inferInsert;

export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;

export type ApprovalStep = typeof approvalSteps.$inferSelect;
export type NewApprovalStep = typeof approvalSteps.$inferInsert;

export type DidRecord = typeof didRecords.$inferSelect;
export type NewDidRecord = typeof didRecords.$inferInsert;

export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;
