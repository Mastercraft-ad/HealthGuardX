import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============= PATIENTS =============
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wallet: text("wallet").notNull().unique(),
  name: text("name").notNull(),
  uid: text("uid").notNull().unique(), // HX-XXXXX format
  qrHash: text("qr_hash").notNull().unique(),
  medicalHistoryCID: text("medical_history_cid"),
  isInsured: boolean("is_insured").default(false),
  insurerWallet: text("insurer_wallet"),
  bloodType: text("blood_type"),
  allergies: text("allergies"),
  emergencySummary: text("emergency_summary"),
  kycStatus: text("kyc_status").default("pending"), // pending, approved, rejected
  kycCID: text("kyc_cid"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patientRelations = relations(patients, ({ many }) => ({
  medicalRecords: many(medicalRecords),
  accessGrants: many(accessGrants),
  emergencyRequests: many(emergencyAccessRequests),
  claims: many(insuranceClaims),
  auditLogs: many(auditLogs),
}));

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

// ============= MEDICAL RECORDS =============
export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientWallet: text("patient_wallet").notNull().references(() => patients.wallet),
  cid: text("cid").notNull(),
  fileHash: text("file_hash").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  purpose: text("purpose"),
  uploaderWallet: text("uploader_wallet").notNull(),
  uploaderRole: text("uploader_role"), // patient, doctor, hospital
  isEncrypted: boolean("is_encrypted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalRecordRelations = relations(medicalRecords, ({ one, many }) => ({
  patient: one(patients, {
    fields: [medicalRecords.patientWallet],
    references: [patients.wallet],
  }),
  accessGrants: many(accessGrants),
}));

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
});

export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

// ============= ACCESS GRANTS =============
export const accessGrants = pgTable("access_grants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientWallet: text("patient_wallet").notNull().references(() => patients.wallet),
  granteeWallet: text("grantee_wallet").notNull(),
  recordId: text("record_id").references(() => medicalRecords.id),
  wrappedKey: text("wrapped_key"), // ECIES encrypted symmetric key
  accessLevel: text("access_level").default("full"), // emergency, full
  expiresAt: timestamp("expires_at"),
  isPreAuthorized: boolean("is_pre_authorized").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export const accessGrantRelations = relations(accessGrants, ({ one }) => ({
  patient: one(patients, {
    fields: [accessGrants.patientWallet],
    references: [patients.wallet],
  }),
  record: one(medicalRecords, {
    fields: [accessGrants.recordId],
    references: [medicalRecords.id],
  }),
}));

export const insertAccessGrantSchema = createInsertSchema(accessGrants).omit({
  id: true,
  createdAt: true,
});

export type InsertAccessGrant = z.infer<typeof insertAccessGrantSchema>;
export type AccessGrant = typeof accessGrants.$inferSelect;

// ============= EMERGENCY ACCESS REQUESTS =============
export const emergencyAccessRequests = pgTable("emergency_access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientWallet: text("patient_wallet").notNull().references(() => patients.wallet),
  requesterWallet: text("requester_wallet").notNull(),
  requesterRole: text("requester_role").notNull(), // doctor, hospital, emergency_responder
  status: text("status").default("pending"), // pending, approved, rejected, expired
  reason: text("reason"),
  location: text("location"),
  grantedBy: text("granted_by"), // admin or patient wallet
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const emergencyAccessRequestRelations = relations(emergencyAccessRequests, ({ one }) => ({
  patient: one(patients, {
    fields: [emergencyAccessRequests.patientWallet],
    references: [patients.wallet],
  }),
}));

export const insertEmergencyAccessRequestSchema = createInsertSchema(emergencyAccessRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertEmergencyAccessRequest = z.infer<typeof insertEmergencyAccessRequestSchema>;
export type EmergencyAccessRequest = typeof emergencyAccessRequests.$inferSelect;

// ============= INSURANCE CLAIMS =============
export const insuranceClaims = pgTable("insurance_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimNumber: text("claim_number").notNull().unique(),
  patientWallet: text("patient_wallet").notNull().references(() => patients.wallet),
  doctorWallet: text("doctor_wallet"),
  hospitalWallet: text("hospital_wallet"),
  insurerWallet: text("insurer_wallet"),
  proofCid: text("proof_cid").notNull(),
  treatmentHash: text("treatment_hash").notNull(),
  treatmentSignature: text("treatment_signature"),
  amount: integer("amount"), // in cents
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, approved, rejected, paid
  diagnosis: text("diagnosis"),
  treatmentSummary: text("treatment_summary"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  paidAt: timestamp("paid_at"),
  reviewedBy: text("reviewed_by"),
  rejectionReason: text("rejection_reason"),
});

export const insuranceClaimRelations = relations(insuranceClaims, ({ one }) => ({
  patient: one(patients, {
    fields: [insuranceClaims.patientWallet],
    references: [patients.wallet],
  }),
}));

export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({
  id: true,
  submittedAt: true,
});

export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;

// ============= ROLE APPLICATIONS =============
export const roleApplications = pgTable("role_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wallet: text("wallet").notNull(),
  roleType: text("role_type").notNull(), // doctor, hospital, insurer, emergency_responder
  kycCID: text("kyc_cid").notNull(),
  status: text("status").default("pending"), // pending, approved, rejected
  licenseNumber: text("license_number"),
  institutionName: text("institution_name"),
  specialization: text("specialization"),
  additionalInfo: jsonb("additional_info"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  rejectionReason: text("rejection_reason"),
});

export const insertRoleApplicationSchema = createInsertSchema(roleApplications).omit({
  id: true,
  createdAt: true,
});

export type InsertRoleApplication = z.infer<typeof insertRoleApplicationSchema>;
export type RoleApplication = typeof roleApplications.$inferSelect;

// ============= AUDIT LOGS =============
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actionType: text("action_type").notNull(), // register, kyc_submitted, kyc_approved, access_granted, emergency_request, claim_submitted, etc.
  actorWallet: text("actor_wallet").notNull(),
  targetWallet: text("target_wallet"), // patient or affected party
  details: jsonb("details"),
  transactionHash: text("transaction_hash"),
  blockNumber: integer("block_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  patient: one(patients, {
    fields: [auditLogs.targetWallet],
    references: [patients.wallet],
  }),
}));

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ============= CONTRACT EVENTS (for real-time feed) =============
export const contractEvents = pgTable("contract_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventName: text("event_name").notNull(),
  eventData: jsonb("event_data").notNull(),
  transactionHash: text("transaction_hash").notNull().unique(),
  blockNumber: integer("block_number").notNull(),
  logIndex: integer("log_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContractEventSchema = createInsertSchema(contractEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertContractEvent = z.infer<typeof insertContractEventSchema>;
export type ContractEvent = typeof contractEvents.$inferSelect;

// ============= SYSTEM SETTINGS =============
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by"),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
