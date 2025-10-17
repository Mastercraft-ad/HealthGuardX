import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Contract, ethers, WebSocketProvider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../client/src/lib/contract";
import { z } from "zod";
import { 
  insertPatientSchema, 
  insertMedicalRecordSchema,
  insertAccessGrantSchema,
  insertEmergencyAccessRequestSchema,
  insertInsuranceClaimSchema,
  insertRoleApplicationSchema
} from "../shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== PATIENT ROUTES ==========
  
  // Get patient by wallet
  app.get("/api/patient/:wallet", async (req, res) => {
    try {
      const patient = await storage.getPatientByWallet(req.params.wallet);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  // Register new patient
  app.post("/api/patient/register", async (req, res) => {
    try {
      // Validate request body
      const registerSchema = insertPatientSchema.pick({
        wallet: true,
        name: true,
        bloodType: true,
        allergies: true,
      }).extend({
        qrHash: z.string().optional(),
      });

      const validatedData = registerSchema.parse(req.body);
      
      // Generate secure UID using crypto
      const randomBytes = crypto.getRandomValues(new Uint8Array(4));
      const uid = `HX-${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase().substring(0, 8)}`;
      
      // Generate QR hash if not provided
      const qrHash = validatedData.qrHash || `qr-${crypto.randomUUID()}`;
      
      const patient = await storage.createPatient({
        wallet: validatedData.wallet,
        name: validatedData.name,
        uid,
        qrHash,
        bloodType: validatedData.bloodType,
        allergies: validatedData.allergies,
        kycStatus: "pending",
      });

      // Log registration
      await storage.createAuditLog({
        actionType: "patient_registered",
        actorWallet: validatedData.wallet,
        targetWallet: validatedData.wallet,
        details: { uid, name: validatedData.name },
      });

      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error registering patient:", error);
      res.status(500).json({ error: "Failed to register patient" });
    }
  });

  // Get patient's medical records
  app.get("/api/patient/records/:wallet", async (req, res) => {
    try {
      const records = await storage.getMedicalRecordsByPatient(req.params.wallet);
      res.json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      res.status(500).json({ error: "Failed to fetch records" });
    }
  });

  // Get patient's access grants
  app.get("/api/patient/access-grants/:wallet", async (req, res) => {
    try {
      const grants = await storage.getAccessGrantsByPatient(req.params.wallet);
      res.json(grants);
    } catch (error) {
      console.error("Error fetching access grants:", error);
      res.status(500).json({ error: "Failed to fetch access grants" });
    }
  });

  // Get patient's audit logs
  app.get("/api/patient/audit-logs/:wallet", async (req, res) => {
    try {
      const logs = await storage.getAuditLogsByTarget(req.params.wallet);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // ========== MEDICAL RECORDS ROUTES ==========
  
  // Upload medical record
  app.post("/api/records/upload", async (req, res) => {
    try {
      const { patientWallet, cid, fileHash, fileName, fileSize, purpose, uploaderWallet, uploaderRole } = req.body;
      
      const record = await storage.createMedicalRecord({
        patientWallet,
        cid,
        fileHash,
        fileName,
        fileSize,
        purpose,
        uploaderWallet,
        uploaderRole,
      });

      // Log upload
      await storage.createAuditLog({
        actionType: "record_uploaded",
        actorWallet: uploaderWallet,
        targetWallet: patientWallet,
        details: { cid, fileName, purpose },
      });

      res.json(record);
    } catch (error) {
      console.error("Error uploading record:", error);
      res.status(500).json({ error: "Failed to upload record" });
    }
  });

  // ========== ACCESS GRANT ROUTES ==========
  
  // Create access grant
  app.post("/api/access-grants/create", async (req, res) => {
    try {
      const { patientWallet, granteeWallet, recordId, wrappedKey, accessLevel, expiresAt } = req.body;
      
      const grant = await storage.createAccessGrant({
        patientWallet,
        granteeWallet,
        recordId,
        wrappedKey,
        accessLevel,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      // Log grant
      await storage.createAuditLog({
        actionType: "access_granted",
        actorWallet: patientWallet,
        targetWallet: granteeWallet,
        details: { recordId, accessLevel },
      });

      res.json(grant);
    } catch (error) {
      console.error("Error creating access grant:", error);
      res.status(500).json({ error: "Failed to create access grant" });
    }
  });

  // Revoke access grant
  app.post("/api/access-grants/revoke/:id", async (req, res) => {
    try {
      await storage.revokeAccessGrant(req.params.id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking access:", error);
      res.status(500).json({ error: "Failed to revoke access" });
    }
  });

  // ========== EMERGENCY ACCESS ROUTES ==========
  
  // Request emergency access
  app.post("/api/emergency/request", async (req, res) => {
    try {
      const { patientWallet, requesterWallet, requesterRole, reason, location } = req.body;
      
      const request = await storage.createEmergencyRequest({
        patientWallet,
        requesterWallet,
        requesterRole,
        reason,
        location,
      });

      // Log emergency request
      await storage.createAuditLog({
        actionType: "emergency_access_requested",
        actorWallet: requesterWallet,
        targetWallet: patientWallet,
        details: { reason, location },
      });

      res.json(request);
    } catch (error) {
      console.error("Error requesting emergency access:", error);
      res.status(500).json({ error: "Failed to request emergency access" });
    }
  });

  // Approve/reject emergency request
  app.post("/api/emergency/resolve/:id", async (req, res) => {
    try {
      const { status, grantedBy } = req.body;
      
      const request = await storage.updateEmergencyRequest(req.params.id, {
        status,
        grantedBy,
        resolvedAt: new Date(),
      });

      res.json(request);
    } catch (error) {
      console.error("Error resolving emergency request:", error);
      res.status(500).json({ error: "Failed to resolve emergency request" });
    }
  });

  // ========== KYC ROUTES ==========
  
  // Submit KYC
  app.post("/api/kyc/submit", async (req, res) => {
    try {
      const { wallet, kycCID } = req.body;
      
      // Update patient KYC
      const patient = await storage.updatePatient(wallet, {
        kycCID,
        kycStatus: "pending",
      });

      // Log KYC submission
      await storage.createAuditLog({
        actionType: "kyc_submitted",
        actorWallet: wallet,
        targetWallet: wallet,
        details: { kycCID },
      });

      res.json(patient);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      res.status(500).json({ error: "Failed to submit KYC" });
    }
  });

  // ========== INSURANCE CLAIMS ROUTES ==========
  
  // Get claims by patient
  app.get("/api/claims/patient/:wallet", async (req, res) => {
    try {
      const claims = await storage.getClaimsByPatient(req.params.wallet);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  // Get claims by insurer
  app.get("/api/claims/insurer/:wallet", async (req, res) => {
    try {
      const claims = await storage.getClaimsByInsurer(req.params.wallet);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  // Submit insurance claim
  app.post("/api/claims/submit", async (req, res) => {
    try {
      const { 
        patientWallet, 
        doctorWallet, 
        hospitalWallet, 
        insurerWallet, 
        proofCid, 
        treatmentHash, 
        treatmentSignature,
        amount,
        diagnosis,
        treatmentSummary
      } = req.body;

      // Generate claim number
      const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      const claim = await storage.createClaim({
        claimNumber,
        patientWallet,
        doctorWallet,
        hospitalWallet,
        insurerWallet,
        proofCid,
        treatmentHash,
        treatmentSignature,
        amount,
        diagnosis,
        treatmentSummary,
      });

      // Log claim submission
      await storage.createAuditLog({
        actionType: "claim_submitted",
        actorWallet: doctorWallet || hospitalWallet,
        targetWallet: patientWallet,
        details: { claimNumber, amount },
      });

      res.json(claim);
    } catch (error) {
      console.error("Error submitting claim:", error);
      res.status(500).json({ error: "Failed to submit claim" });
    }
  });

  // Approve/reject claim
  app.post("/api/claims/review/:id", async (req, res) => {
    try {
      const { status, reviewedBy, rejectionReason } = req.body;
      
      const claim = await storage.updateClaim(req.params.id, {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        rejectionReason,
        paidAt: status === 'approved' ? new Date() : undefined,
      });

      // Log claim review
      await storage.createAuditLog({
        actionType: status === 'approved' ? 'claim_approved' : 'claim_rejected',
        actorWallet: reviewedBy,
        targetWallet: claim?.patientWallet,
        details: { claimId: req.params.id, status },
      });

      res.json(claim);
    } catch (error) {
      console.error("Error reviewing claim:", error);
      res.status(500).json({ error: "Failed to review claim" });
    }
  });

  // ========== ROLE APPLICATION ROUTES ==========
  
  // Submit role application
  app.post("/api/roles/apply", async (req, res) => {
    try {
      const { wallet, roleType, kycCID, licenseNumber, institutionName, specialization, additionalInfo } = req.body;
      
      const application = await storage.createRoleApplication({
        wallet,
        roleType,
        kycCID,
        licenseNumber,
        institutionName,
        specialization,
        additionalInfo,
      });

      // Log application
      await storage.createAuditLog({
        actionType: "role_application_submitted",
        actorWallet: wallet,
        targetWallet: wallet,
        details: { roleType },
      });

      res.json(application);
    } catch (error) {
      console.error("Error submitting role application:", error);
      res.status(500).json({ error: "Failed to submit role application" });
    }
  });

  // ========== ADMIN ROUTES ==========
  
  // Get system stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get KYC queue (pending patients and role applications)
  app.get("/api/admin/kyc-queue", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      const pendingKYC = patients.filter(p => p.kycStatus === 'pending' && p.kycCID);
      res.json(pendingKYC);
    } catch (error) {
      console.error("Error fetching KYC queue:", error);
      res.status(500).json({ error: "Failed to fetch KYC queue" });
    }
  });

  // Get role applications
  app.get("/api/admin/role-applications", async (req, res) => {
    try {
      const applications = await storage.getAllPendingRoleApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching role applications:", error);
      res.status(500).json({ error: "Failed to fetch role applications" });
    }
  });

  // Approve/reject KYC
  app.post("/api/admin/approve-kyc", async (req, res) => {
    try {
      const { wallet, approved } = req.body;
      
      const patient = await storage.updatePatient(wallet, {
        kycStatus: approved ? 'approved' : 'rejected',
      });

      // Log KYC decision
      await storage.createAuditLog({
        actionType: approved ? 'kyc_approved' : 'kyc_rejected',
        actorWallet: 'admin', // Should be actual admin wallet
        targetWallet: wallet,
        details: { approved },
      });

      res.json(patient);
    } catch (error) {
      console.error("Error approving KYC:", error);
      res.status(500).json({ error: "Failed to approve KYC" });
    }
  });

  // Approve/reject role application
  app.post("/api/admin/approve-role", async (req, res) => {
    try {
      const { id, approved } = req.body;
      
      const application = await storage.updateRoleApplication(id, {
        status: approved ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: 'admin', // Should be actual admin wallet
      });

      res.json(application);
    } catch (error) {
      console.error("Error approving role:", error);
      res.status(500).json({ error: "Failed to approve role" });
    }
  });

  // Get recent events
  app.get("/api/admin/events", async (req, res) => {
    try {
      const events = await storage.getRecentContractEvents(50);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // ========== DOCTOR ROUTES ==========
  
  // Get doctor stats
  app.get("/api/doctor/stats/:wallet", async (req, res) => {
    try {
      const { wallet } = req.params;
      
      // Get access grants where this doctor is the grantee
      const grants = await storage.getAccessGrantsByGrantee(wallet);
      const uniquePatients = new Set(grants.map(g => g.patientWallet));
      
      // Get records uploaded by this doctor
      const allRecords = await storage.getMedicalRecordsByPatient(wallet);
      const doctorRecords = allRecords.filter(r => r.uploaderWallet === wallet);
      
      const stats = {
        totalPatients: uniquePatients.size,
        consultations: grants.length,
        treatments: doctorRecords.length,
        activeCases: grants.filter(g => !g.revokedAt).length,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching doctor stats:", error);
      res.status(500).json({ error: "Failed to fetch doctor stats" });
    }
  });

  // Get doctor's recent patients
  app.get("/api/doctor/patients/:wallet", async (req, res) => {
    try {
      // In production, would query based on access grants
      const patients: any[] = [];
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  // ========== ACTIVITY FEED ==========
  
  // Get live activity feed
  app.get("/api/activity-feed", async (req, res) => {
    try {
      const events = await storage.getRecentContractEvents(20);
      const auditLogs = await storage.getRecentAuditLogs(20);
      
      // Combine and format for display
      const activity = [
        ...events.map(e => ({
          description: formatEventDescription(e.eventName, e.eventData),
          timestamp: e.createdAt,
        })),
        ...auditLogs.map(l => ({
          description: formatAuditDescription(l.actionType, l.details),
          timestamp: l.createdAt,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ error: "Failed to fetch activity feed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper functions
function formatEventDescription(eventName: string, eventData: any): string {
  switch (eventName) {
    case 'NewPatientRegistered':
      return `New patient registered: UID ${eventData.patientId}`;
    case 'RecordUpdated':
      return `Medical record updated for patient ${eventData.patient?.slice(0, 6)}...`;
    case 'InsuranceStatusUpdated':
      return `Insurance status updated for ${eventData.patient?.slice(0, 6)}...`;
    default:
      return `Event: ${eventName}`;
  }
}

function formatAuditDescription(actionType: string, details: any): string {
  switch (actionType) {
    case 'patient_registered':
      return `Patient ${details.name} registered with UID ${details.uid}`;
    case 'record_uploaded':
      return `New medical record uploaded: ${details.fileName}`;
    case 'claim_submitted':
      return `Insurance claim ${details.claimNumber} submitted`;
    case 'kyc_approved':
      return `KYC approved for patient`;
    default:
      return `Action: ${actionType}`;
  }
}
