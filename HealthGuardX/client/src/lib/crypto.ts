import nacl from "tweetnacl";
import { encodeBase64, decodeBase64 } from "tweetnacl-util";

/**
 * Client-side encryption utilities for medical records
 * Uses AES-256-GCM equivalent (XSalsa20-Poly1305) for file encryption
 * and public key cryptography for key wrapping
 */

// Generate a random symmetric key for file encryption
export function generateSymmetricKey(): Uint8Array {
  return nacl.randomBytes(nacl.secretbox.keyLength);
}

// Encrypt a file with a symmetric key
export async function encryptFile(
  fileData: ArrayBuffer,
  key: Uint8Array
): Promise<{ encrypted: Uint8Array; nonce: Uint8Array }> {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageUint8 = new Uint8Array(fileData);
  const encrypted = nacl.secretbox(messageUint8, nonce, key);
  
  return { encrypted, nonce };
}

// Decrypt a file with a symmetric key
export async function decryptFile(
  encryptedData: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array
): Promise<Uint8Array | null> {
  return nacl.secretbox.open(encryptedData, nonce, key);
}

// Generate a keypair for asymmetric encryption (ECIES-like)
export function generateKeyPair(): nacl.BoxKeyPair {
  return nacl.box.keyPair();
}

// Wrap a symmetric key with recipient's public key
export function wrapKey(
  symmetricKey: Uint8Array,
  recipientPublicKey: Uint8Array,
  senderSecretKey: Uint8Array
): { wrapped: Uint8Array; nonce: Uint8Array } {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const wrapped = nacl.box(symmetricKey, nonce, recipientPublicKey, senderSecretKey);
  
  return { wrapped, nonce };
}

// Unwrap a symmetric key with recipient's private key
export function unwrapKey(
  wrappedKey: Uint8Array,
  nonce: Uint8Array,
  senderPublicKey: Uint8Array,
  recipientSecretKey: Uint8Array
): Uint8Array | null {
  return nacl.box.open(wrappedKey, nonce, senderPublicKey, recipientSecretKey);
}

// Hash a file for integrity verification
export async function hashFile(fileData: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", fileData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Encode key/nonce to base64 for storage
export function encodeKey(key: Uint8Array): string {
  return encodeBase64(key);
}

// Decode key/nonce from base64
export function decodeKey(encoded: string): Uint8Array {
  return decodeBase64(encoded);
}

/**
 * Complete encryption flow for medical record upload:
 * 
 * 1. Generate symmetric key
 * 2. Encrypt file with symmetric key
 * 3. Hash original file
 * 4. Wrap symmetric key with recipient's public key (for access grant)
 * 5. Upload encrypted file to IPFS -> get CID
 * 6. Store: CID, fileHash, wrappedKey in database
 * 
 * Decryption flow:
 * 1. Fetch encrypted file from IPFS using CID
 * 2. Unwrap symmetric key with recipient's private key
 * 3. Decrypt file with symmetric key
 * 4. Verify hash matches stored hash
 */

export interface EncryptedFilePackage {
  encryptedData: Uint8Array;
  nonce: Uint8Array;
  symmetricKey: Uint8Array;
  fileHash: string;
}

export async function prepareFileForUpload(file: File): Promise<EncryptedFilePackage> {
  // Read file
  const fileData = await file.arrayBuffer();
  
  // Generate symmetric key
  const symmetricKey = generateSymmetricKey();
  
  // Encrypt file
  const { encrypted, nonce } = await encryptFile(fileData, symmetricKey);
  
  // Hash original file
  const fileHash = await hashFile(fileData);
  
  return {
    encryptedData: encrypted,
    nonce,
    symmetricKey,
    fileHash,
  };
}

// Mock IPFS upload (in production, would use real IPFS client)
export async function uploadToIPFS(data: Uint8Array): Promise<string> {
  // In production, would use actual IPFS upload
  // For now, generate a mock CID
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `Qm${hashHex.substring(0, 44)}`; // Mock CIDv0 format
}

// Mock IPFS download
export async function downloadFromIPFS(cid: string): Promise<Uint8Array> {
  // In production, would fetch from IPFS
  // For now, return empty data
  throw new Error("IPFS download not implemented in demo mode");
}

/**
 * Generate QR code data hash for patient
 * This hash is used in QR codes for emergency access
 */
export async function generateQRHash(patientWallet: string): Promise<string> {
  const timestamp = Date.now().toString();
  const data = `${patientWallet}-${timestamp}`;
  
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// Synchronous version using simpler hash
export function generateQRHashSync(patientWallet: string): string {
  const timestamp = Date.now().toString();
  const data = `${patientWallet}-${timestamp}`;
  
  // Simple hash for demo (in production, use proper crypto)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32);
}
