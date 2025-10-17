// HealthGuardX Smart Contract Configuration
export const CONTRACT_ADDRESS = "0xdDe2C1088D5353B61f54F1666Ec411499aBeacf7";
export const ADMIN_WALLET = "0x3c17f3F514658fACa2D24DE1d29F542a836FD10A";

export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "admin", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "bytes32", "name": "neededRole", "type": "bytes32"}
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [{"internalType": "address", "name": "doctor", "type": "address"}],
    "name": "addDoctor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "hospital", "type": "address"}],
    "name": "addHospital",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "insurer", "type": "address"}],
    "name": "addInsurer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "patient", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "status", "type": "bool"},
      {"indexed": false, "internalType": "address", "name": "insurer", "type": "address"}
    ],
    "name": "InsuranceStatusUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "wallet", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "patientId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "qrHash", "type": "string"}
    ],
    "name": "NewPatientRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "pauseSystem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "patient", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "newCID", "type": "string"}
    ],
    "name": "RecordUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "qrHash", "type": "string"}
    ],
    "name": "registerPatient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "callerConfirmation", "type": "address"}
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32"},
      {"indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32"}
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"}
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"}
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "unpauseSystem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "patientWallet", "type": "address"},
      {"internalType": "bool", "name": "status", "type": "bool"}
    ],
    "name": "updateInsuranceStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "patientWallet", "type": "address"},
      {"internalType": "string", "name": "newCID", "type": "string"}
    ],
    "name": "updateMedicalRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ADMIN_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DOCTOR_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "qrHash", "type": "string"}],
    "name": "getPatientByQR",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "qrHash", "type": "string"},
          {"internalType": "string", "name": "medicalHistoryCID", "type": "string"},
          {"internalType": "bool", "name": "isInsured", "type": "bool"},
          {"internalType": "address", "name": "wallet", "type": "address"}
        ],
        "internalType": "struct HealthGuardX.Patient",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}],
    "name": "getRoleAdmin",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "hasRole",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "HOSPITAL_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "INSURER_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PATIENT_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "patients",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "qrHash", "type": "string"},
      {"internalType": "string", "name": "medicalHistoryCID", "type": "string"},
      {"internalType": "bool", "name": "isInsured", "type": "bool"},
      {"internalType": "address", "name": "wallet", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "qrToPatient",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}],
    "name": "supportsInterface",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Role hashes (keccak256)
export const ROLES = {
  ADMIN: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
  DOCTOR: "0x5f5cfed788fabd5eb92e5a2e25321a285258b4f37f8940f94d59b14dbc7e8087",
  HOSPITAL: "0x3a6357012c8ba2a310a62b01b9c7f8d8e8c15c6b91e3b6f2e7c3d1a5f4e9b8c7",
  INSURER: "0x2db9fd3d099848027c2383d0a083396f6c41510d7acfd92adc99b6cffcf31e96",
  PATIENT: "0x1d4f9bbfc9a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9",
} as const;
