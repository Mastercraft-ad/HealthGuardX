import { Contract, WebSocketProvider, ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../client/src/lib/contract";
import { storage } from "./storage";

let contract: Contract | null = null;
let provider: WebSocketProvider | null = null;

export async function startEventListener() {
  try {
    // Note: In production, use a WebSocket RPC URL (e.g., Infura, Alchemy)
    // For development, we'll use a polling provider
    const rpcUrl = process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";
    
    // Use regular provider for now
    const ethProvider = new ethers.JsonRpcProvider(rpcUrl);
    contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethProvider);

    console.log("🎧 Starting contract event listener...");
    console.log(`📡 Contract: ${CONTRACT_ADDRESS}`);

    // Listen for NewPatientRegistered events
    contract.on("NewPatientRegistered", async (wallet, patientId, qrHash, event) => {
      console.log("📝 NewPatientRegistered:", { wallet, patientId, qrHash });
      
      try {
        await storage.createContractEvent({
          eventName: "NewPatientRegistered",
          eventData: { wallet, patientId: patientId.toString(), qrHash },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          logIndex: event.log.index,
        });

        await storage.createAuditLog({
          actionType: "patient_registered_onchain",
          actorWallet: wallet,
          targetWallet: wallet,
          details: { patientId: patientId.toString(), qrHash },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
      } catch (error) {
        console.error("Error storing NewPatientRegistered event:", error);
      }
    });

    // Listen for RecordUpdated events
    contract.on("RecordUpdated", async (patient, newCID, event) => {
      console.log("📄 RecordUpdated:", { patient, newCID });
      
      try {
        await storage.createContractEvent({
          eventName: "RecordUpdated",
          eventData: { patient, newCID },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          logIndex: event.log.index,
        });

        await storage.createAuditLog({
          actionType: "record_updated_onchain",
          actorWallet: patient,
          targetWallet: patient,
          details: { newCID },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
      } catch (error) {
        console.error("Error storing RecordUpdated event:", error);
      }
    });

    // Listen for InsuranceStatusUpdated events
    contract.on("InsuranceStatusUpdated", async (patient, status, insurer, event) => {
      console.log("🏥 InsuranceStatusUpdated:", { patient, status, insurer });
      
      try {
        await storage.createContractEvent({
          eventName: "InsuranceStatusUpdated",
          eventData: { patient, status, insurer },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          logIndex: event.log.index,
        });

        await storage.createAuditLog({
          actionType: "insurance_status_updated",
          actorWallet: insurer,
          targetWallet: patient,
          details: { status },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
      } catch (error) {
        console.error("Error storing InsuranceStatusUpdated event:", error);
      }
    });

    // Listen for RoleGranted events
    contract.on("RoleGranted", async (role, account, sender, event) => {
      console.log("👤 RoleGranted:", { role, account, sender });
      
      try {
        await storage.createContractEvent({
          eventName: "RoleGranted",
          eventData: { role, account, sender },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          logIndex: event.log.index,
        });

        await storage.createAuditLog({
          actionType: "role_granted_onchain",
          actorWallet: sender,
          targetWallet: account,
          details: { role },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
      } catch (error) {
        console.error("Error storing RoleGranted event:", error);
      }
    });

    // Listen for RoleRevoked events
    contract.on("RoleRevoked", async (role, account, sender, event) => {
      console.log("🚫 RoleRevoked:", { role, account, sender });
      
      try {
        await storage.createContractEvent({
          eventName: "RoleRevoked",
          eventData: { role, account, sender },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          logIndex: event.log.index,
        });

        await storage.createAuditLog({
          actionType: "role_revoked_onchain",
          actorWallet: sender,
          targetWallet: account,
          details: { role },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
      } catch (error) {
        console.error("Error storing RoleRevoked event:", error);
      }
    });

    // Listen for Paused/Unpaused events
    contract.on("Paused", async (account, event) => {
      console.log("⏸️ System Paused by:", account);
      
      try {
        await storage.createContractEvent({
          eventName: "Paused",
          eventData: { account },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          logIndex: event.log.index,
        });

        await storage.createAuditLog({
          actionType: "system_paused",
          actorWallet: account,
          targetWallet: account,
          details: {},
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
      } catch (error) {
        console.error("Error storing Paused event:", error);
      }
    });

    contract.on("Unpaused", async (account, event) => {
      console.log("▶️ System Unpaused by:", account);
      
      try {
        await storage.createContractEvent({
          eventName: "Unpaused",
          eventData: { account },
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          logIndex: event.log.index,
        });

        await storage.createAuditLog({
          actionType: "system_unpaused",
          actorWallet: account,
          targetWallet: account,
          details: {},
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
      } catch (error) {
        console.error("Error storing Unpaused event:", error);
      }
    });

    console.log("✅ Event listener started successfully");
  } catch (error) {
    console.error("❌ Failed to start event listener:", error);
    console.log("⚠️ Continuing without event listener - events won't be captured");
  }
}

export function stopEventListener() {
  if (contract) {
    contract.removeAllListeners();
    console.log("🛑 Event listener stopped");
  }
}

// Helper to fetch historical events on startup
export async function fetchHistoricalEvents(fromBlock: number = 0) {
  if (!contract) {
    console.log("⚠️ Contract not initialized, skipping historical events");
    return;
  }

  try {
    console.log(`🔍 Fetching historical events from block ${fromBlock}...`);
    
    const currentBlock = await contract.runner?.provider?.getBlockNumber();
    if (!currentBlock) {
      console.log("⚠️ Could not get current block number");
      return;
    }

    // Fetch all events in batches to avoid rate limits
    const batchSize = 1000;
    for (let i = fromBlock; i <= currentBlock; i += batchSize) {
      const toBlock = Math.min(i + batchSize - 1, currentBlock);
      
      const filter = {
        address: CONTRACT_ADDRESS,
        fromBlock: i,
        toBlock,
      };

      const logs = await contract.runner?.provider?.getLogs(filter);
      
      if (logs && logs.length > 0) {
        console.log(`📦 Found ${logs.length} events in blocks ${i}-${toBlock}`);
        
        // Process logs (parse and store)
        for (const log of logs) {
          try {
            const parsedLog = contract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data,
            });
            
            if (parsedLog) {
              // Store event (check if not already stored)
              const existing = await storage.getRecentContractEvents(1);
              // Skip if already exists (simple check)
              
              await storage.createContractEvent({
                eventName: parsedLog.name,
                eventData: parsedLog.args.toObject(),
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber,
                logIndex: log.index,
              });
            }
          } catch (parseError) {
            // Skip unparseable logs
          }
        }
      }
    }
    
    console.log("✅ Historical events fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching historical events:", error);
  }
}
