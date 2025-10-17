// Storage layer implementation using javascript_database blueprint
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import {
  patients,
  medicalRecords,
  accessGrants,
  emergencyAccessRequests,
  insuranceClaims,
  roleApplications,
  auditLogs,
  contractEvents,
  systemSettings,
  type Patient,
  type InsertPatient,
  type MedicalRecord,
  type InsertMedicalRecord,
  type AccessGrant,
  type InsertAccessGrant,
  type EmergencyAccessRequest,
  type InsertEmergencyAccessRequest,
  type InsuranceClaim,
  type InsertInsuranceClaim,
  type RoleApplication,
  type InsertRoleApplication,
  type AuditLog,
  type InsertAuditLog,
  type ContractEvent,
  type InsertContractEvent,
  type SystemSetting,
  type InsertSystemSetting,
} from "@shared/schema";

export interface IStorage {
  // Patients
  getPatientByWallet(wallet: string): Promise<Patient | undefined>;
  getPatientByUID(uid: string): Promise<Patient | undefined>;
  getPatientByQRHash(qrHash: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(wallet: string, updates: Partial<InsertPatient>): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;

  // Medical Records
  getMedicalRecordsByPatient(patientWallet: string): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  getMedicalRecordById(id: string): Promise<MedicalRecord | undefined>;

  // Access Grants
  getAccessGrantsByPatient(patientWallet: string): Promise<AccessGrant[]>;
  getAccessGrantsByGrantee(granteeWallet: string): Promise<AccessGrant[]>;
  createAccessGrant(grant: InsertAccessGrant): Promise<AccessGrant>;
  revokeAccessGrant(id: string): Promise<void>;

  // Emergency Access
  getEmergencyRequestsByPatient(patientWallet: string): Promise<EmergencyAccessRequest[]>;
  createEmergencyRequest(request: InsertEmergencyAccessRequest): Promise<EmergencyAccessRequest>;
  updateEmergencyRequest(id: string, updates: Partial<InsertEmergencyAccessRequest>): Promise<EmergencyAccessRequest | undefined>;

  // Insurance Claims
  getClaimsByPatient(patientWallet: string): Promise<InsuranceClaim[]>;
  getClaimsByInsurer(insurerWallet: string): Promise<InsuranceClaim[]>;
  createClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim>;
  updateClaim(id: string, updates: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim | undefined>;
  getAllPendingClaims(): Promise<InsuranceClaim[]>;

  // Role Applications
  getRoleApplicationsByWallet(wallet: string): Promise<RoleApplication[]>;
  getAllPendingRoleApplications(): Promise<RoleApplication[]>;
  createRoleApplication(application: InsertRoleApplication): Promise<RoleApplication>;
  updateRoleApplication(id: string, updates: Partial<InsertRoleApplication>): Promise<RoleApplication | undefined>;

  // Audit Logs
  getAuditLogsByWallet(wallet: string): Promise<AuditLog[]>;
  getAuditLogsByTarget(targetWallet: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getRecentAuditLogs(limit: number): Promise<AuditLog[]>;

  // Contract Events
  createContractEvent(event: InsertContractEvent): Promise<ContractEvent>;
  getRecentContractEvents(limit: number): Promise<ContractEvent[]>;

  // System Settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;

  // Stats
  getSystemStats(): Promise<{
    totalUsers: number;
    activePatients: number;
    pendingClaims: number;
    emergencyEvents: number;
    totalDoctors: number;
    totalHospitals: number;
    totalInsurers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Patients
  async getPatientByWallet(wallet: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.wallet, wallet));
    return patient || undefined;
  }

  async getPatientByUID(uid: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.uid, uid));
    return patient || undefined;
  }

  async getPatientByQRHash(qrHash: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.qrHash, qrHash));
    return patient || undefined;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async updatePatient(wallet: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updated] = await db
      .update(patients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patients.wallet, wallet))
      .returning();
    return updated || undefined;
  }

  async getAllPatients(): Promise<Patient[]> {
    return db.select().from(patients);
  }

  // Medical Records
  async getMedicalRecordsByPatient(patientWallet: string): Promise<MedicalRecord[]> {
    return db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientWallet, patientWallet))
      .orderBy(desc(medicalRecords.createdAt));
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [newRecord] = await db.insert(medicalRecords).values(record).returning();
    return newRecord;
  }

  async getMedicalRecordById(id: string): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record || undefined;
  }

  // Access Grants
  async getAccessGrantsByPatient(patientWallet: string): Promise<AccessGrant[]> {
    return db
      .select()
      .from(accessGrants)
      .where(eq(accessGrants.patientWallet, patientWallet))
      .orderBy(desc(accessGrants.createdAt));
  }

  async getAccessGrantsByGrantee(granteeWallet: string): Promise<AccessGrant[]> {
    return db
      .select()
      .from(accessGrants)
      .where(eq(accessGrants.granteeWallet, granteeWallet));
  }

  async createAccessGrant(grant: InsertAccessGrant): Promise<AccessGrant> {
    const [newGrant] = await db.insert(accessGrants).values(grant).returning();
    return newGrant;
  }

  async revokeAccessGrant(id: string): Promise<void> {
    await db
      .update(accessGrants)
      .set({ revokedAt: new Date() })
      .where(eq(accessGrants.id, id));
  }

  // Emergency Access
  async getEmergencyRequestsByPatient(patientWallet: string): Promise<EmergencyAccessRequest[]> {
    return db
      .select()
      .from(emergencyAccessRequests)
      .where(eq(emergencyAccessRequests.patientWallet, patientWallet))
      .orderBy(desc(emergencyAccessRequests.createdAt));
  }

  async createEmergencyRequest(request: InsertEmergencyAccessRequest): Promise<EmergencyAccessRequest> {
    const [newRequest] = await db.insert(emergencyAccessRequests).values(request).returning();
    return newRequest;
  }

  async updateEmergencyRequest(id: string, updates: Partial<InsertEmergencyAccessRequest>): Promise<EmergencyAccessRequest | undefined> {
    const [updated] = await db
      .update(emergencyAccessRequests)
      .set(updates)
      .where(eq(emergencyAccessRequests.id, id))
      .returning();
    return updated || undefined;
  }

  // Insurance Claims
  async getClaimsByPatient(patientWallet: string): Promise<InsuranceClaim[]> {
    return db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.patientWallet, patientWallet))
      .orderBy(desc(insuranceClaims.submittedAt));
  }

  async getClaimsByInsurer(insurerWallet: string): Promise<InsuranceClaim[]> {
    return db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.insurerWallet, insurerWallet))
      .orderBy(desc(insuranceClaims.submittedAt));
  }

  async createClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim> {
    const [newClaim] = await db.insert(insuranceClaims).values(claim).returning();
    return newClaim;
  }

  async updateClaim(id: string, updates: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim | undefined> {
    const [updated] = await db
      .update(insuranceClaims)
      .set(updates)
      .where(eq(insuranceClaims.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllPendingClaims(): Promise<InsuranceClaim[]> {
    return db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.status, "pending"));
  }

  // Role Applications
  async getRoleApplicationsByWallet(wallet: string): Promise<RoleApplication[]> {
    return db
      .select()
      .from(roleApplications)
      .where(eq(roleApplications.wallet, wallet));
  }

  async getAllPendingRoleApplications(): Promise<RoleApplication[]> {
    return db
      .select()
      .from(roleApplications)
      .where(eq(roleApplications.status, "pending"));
  }

  async createRoleApplication(application: InsertRoleApplication): Promise<RoleApplication> {
    const [newApp] = await db.insert(roleApplications).values(application).returning();
    return newApp;
  }

  async updateRoleApplication(id: string, updates: Partial<InsertRoleApplication>): Promise<RoleApplication | undefined> {
    const [updated] = await db
      .update(roleApplications)
      .set(updates)
      .where(eq(roleApplications.id, id))
      .returning();
    return updated || undefined;
  }

  // Audit Logs
  async getAuditLogsByWallet(wallet: string): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.actorWallet, wallet))
      .orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByTarget(targetWallet: string): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.targetWallet, targetWallet))
      .orderBy(desc(auditLogs.createdAt));
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }

  async getRecentAuditLogs(limit: number): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  // Contract Events
  async createContractEvent(event: InsertContractEvent): Promise<ContractEvent> {
    const [newEvent] = await db.insert(contractEvents).values(event).returning();
    return newEvent;
  }

  async getRecentContractEvents(limit: number): Promise<ContractEvent[]> {
    return db
      .select()
      .from(contractEvents)
      .orderBy(desc(contractEvents.createdAt))
      .limit(limit);
  }

  // System Settings
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting || undefined;
  }

  async setSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(setting.key);
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(systemSettings.key, setting.key))
        .returning();
      return updated;
    } else {
      const [newSetting] = await db.insert(systemSettings).values(setting).returning();
      return newSetting;
    }
  }

  // Stats
  async getSystemStats() {
    const allPatients = await this.getAllPatients();
    const pendingClaims = await this.getAllPendingClaims();
    
    // Mock stats for now - in production, these would come from role checks
    return {
      totalUsers: allPatients.length,
      activePatients: allPatients.filter(p => p.kycStatus === 'approved').length,
      pendingClaims: pendingClaims.length,
      emergencyEvents: 0, // Would count recent emergency requests
      totalDoctors: 0,
      totalHospitals: 0,
      totalInsurers: 0,
    };
  }
}

export const storage = new DatabaseStorage();
