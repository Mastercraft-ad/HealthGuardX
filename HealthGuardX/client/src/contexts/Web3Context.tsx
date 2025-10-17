import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, ADMIN_WALLET, ROLES } from "@/lib/contract";

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  account: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  userRoles: string[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loading: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const checkRoles = async (address: string, contractInstance: Contract) => {
    const roles: string[] = [];
    
    try {
      // Check if admin
      const hasAdminRole = await contractInstance.hasRole(ROLES.ADMIN, address);
      if (hasAdminRole) roles.push("admin");
      
      // Check other roles
      const hasDoctorRole = await contractInstance.hasRole(ROLES.DOCTOR, address);
      if (hasDoctorRole) roles.push("doctor");
      
      const hasHospitalRole = await contractInstance.hasRole(ROLES.HOSPITAL, address);
      if (hasHospitalRole) roles.push("hospital");
      
      const hasInsurerRole = await contractInstance.hasRole(ROLES.INSURER, address);
      if (hasInsurerRole) roles.push("insurer");
      
      const hasPatientRole = await contractInstance.hasRole(ROLES.PATIENT, address);
      if (hasPatientRole) roles.push("patient");
      
      // Check if patient exists in contract
      try {
        const patient = await contractInstance.patients(address);
        if (patient.wallet !== "0x0000000000000000000000000000000000000000") {
          if (!roles.includes("patient")) roles.push("patient");
        }
      } catch (e) {
        console.log("Not a registered patient");
      }
    } catch (error) {
      console.error("Error checking roles:", error);
    }
    
    return roles;
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const web3Provider = new BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const walletAddress = accounts[0];
      
      const web3Signer = await web3Provider.getSigner();
      const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(walletAddress);
      setIsConnected(true);

      // Check if admin wallet
      const adminCheck = walletAddress.toLowerCase() === ADMIN_WALLET.toLowerCase();
      setIsAdmin(adminCheck);

      // Check roles on contract
      const roles = await checkRoles(walletAddress, contractInstance);
      setUserRoles(roles);

    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
    setIsAdmin(false);
    setUserRoles([]);
  };

  // Auto-connect if already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const web3Provider = new BrowserProvider(window.ethereum);
          const accounts = await web3Provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error("Auto-connect failed:", error);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", connectWallet);
        window.ethereum.removeListener("chainChanged", () => window.location.reload());
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        account,
        isConnected,
        isAdmin,
        userRoles,
        connectWallet,
        disconnectWallet,
        loading,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
