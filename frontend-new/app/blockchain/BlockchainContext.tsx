'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { PROPERTY_FACTORY_ADDRESS, PROPERTY_FACTORY_ABI } from './config';
import { getPropertyFactoryContract } from './config';

// Types
export interface PropertyDetails {
  propertyId: number;
  tokenAddress: string;
  name: string;
  symbol: string;
  propertyValue: string;
  totalShares: number;
  availableShares: number;
  minInvestment: string;
  propertyURI: string;
  isFundingComplete: boolean;
  createdAt: number;
}

export type InvestorDetails = {
  investmentAmount: string;
  shareCount: number;
  ownership: number; // percentage (scaled by 10000)
  unclaimedIncome: string;
  claimedIncome: string;
};

// Context interface
interface BlockchainContextType {
  isConnected: boolean;
  account: string | null;
  provider: any;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loadProperties: () => Promise<PropertyDetails[]>;
  investInProperty: (propertyId: number, amount: string) => Promise<boolean>;
  properties: PropertyDetails[];
  getInvestorDetails: (propertyId: number) => Promise<InvestorDetails | null>;
  claimRentalIncome: (propertyId: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

// Create context
const BlockchainContext = createContext<BlockchainContextType>({
  isConnected: false,
  account: null,
  provider: null,
  signer: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  loadProperties: async () => [],
  investInProperty: async () => false,
  properties: [],
  getInvestorDetails: async () => null,
  claimRentalIncome: async () => false,
  loading: false,
  error: null
});

// Custom hook to use the blockchain context
export const useBlockchain = () => useContext(BlockchainContext);

// Provider component
export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [properties, setProperties] = useState<PropertyDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const checkIfMetaMaskIsInstalled = () => {
    if (typeof window !== 'undefined') {
      return Boolean(window.ethereum);
    }
    return false;
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!checkIfMetaMaskIsInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check if we got accounts back
      if (accounts.length === 0) {
        throw new Error('No accounts found.');
      }

      // Set up provider and signer
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      
      setAccount(accounts[0]);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setIsConnected(true);
      
      // Setup listeners for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
      
      setLoading(false);
      
      // Load properties after connecting
      await loadProperties();
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      setLoading(false);
    }
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User has disconnected their wallet
      disconnectWallet();
    } else if (accounts[0] !== account) {
      // User has switched accounts
      setAccount(accounts[0]);
      
      if (provider) {
        const signer = await provider.getSigner();
        setSigner(signer);
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  };

  // Load properties from blockchain
  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!provider) {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
      }

      const factoryContract = getPropertyFactoryContract(provider || new ethers.BrowserProvider(window.ethereum));
      
      // Get total number of properties
      const count = await factoryContract.getPropertyCount();
      const properties: PropertyDetails[] = [];

      // Fetch details for each property
      for (let i = 1; i <= count.toNumber(); i++) {
        try {
          const details = await factoryContract.getPropertyDetails(i);
          properties.push({
            propertyId: details.propertyId.toNumber(),
            tokenAddress: details.tokenAddress,
            name: details.name,
            symbol: details.symbol,
            propertyValue: ethers.formatEther(details.propertyValue),
            totalShares: details.totalShares.toNumber(),
            availableShares: details.availableShares.toNumber(),
            minInvestment: ethers.formatEther(details.minInvestment),
            propertyURI: details.propertyURI,
            isFundingComplete: details.isFundingComplete,
            createdAt: details.createdAt.toNumber()
          });
        } catch (err) {
          console.error(`Error fetching property ${i}:`, err);
        }
      }

      setProperties(properties);
      setLoading(false);
      return properties;
    } catch (err: any) {
      console.error('Error loading properties:', err);
      setError(err.message || 'Failed to load properties');
      setLoading(false);
      return [];
    }
  };

  // Invest in property using real blockchain interaction
  const investInProperty = async (propertyId: number, amount: string) => {
    if (!isConnected || !signer) {
      setError('Please connect your wallet first');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const factoryContract = new ethers.Contract(
        PROPERTY_FACTORY_ADDRESS,
        PROPERTY_FACTORY_ABI,
        provider
      ).connect(signer) as ethers.Contract & {
        investInProperty: (propertyId: number, options: { value: bigint }) => Promise<ethers.ContractTransactionResponse>;
      };

      const amountInWei = ethers.parseEther(amount);

      // Call the invest function
      const tx = await factoryContract.investInProperty(propertyId, {
        value: amountInWei
      });

      // Wait for transaction confirmation
      await tx.wait();

      // Reload properties to get updated state
      await loadProperties();
      
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Error investing in property:', err);
      setError(err.message || 'Failed to invest in property');
      setLoading(false);
      return false;
    }
  };

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (checkIfMetaMaskIsInstalled() && window.ethereum?.isConnected()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      } else {
        // If no wallet connected, still load properties
        loadProperties();
      }
    };

    checkConnection();
    
    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Get investor details - mock implementation
  const getInvestorDetails = async (propertyId: number): Promise<InvestorDetails | null> => {
    if (!isConnected || !account) {
      setError("Wallet not connected");
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        investmentAmount: "0.2",
        shareCount: 20,
        ownership: 1000, // 10.00%
        unclaimedIncome: "0.015",
        claimedIncome: "0.02"
      };
    } catch (error: any) {
      console.error("Failed to get investor details:", error);
      setError(error.message || "Failed to get investor details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Claim rental income - mock implementation
  const claimRentalIncome = async (propertyId: number): Promise<boolean> => {
    if (!isConnected) {
      setError("Wallet not connected");
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error: any) {
      console.error("Failed to claim rental income:", error);
      setError(error.message || "Failed to claim rental income");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mock properties for testing
  const getMockProperties = (): PropertyDetails[] => {
    return [
      {
        propertyId: 0,
        tokenAddress: "0x1234567890123456789012345678901234567890",
        name: "Downtown Luxury Apartment",
        symbol: "DLA",
        propertyValue: "0.5",
        totalShares: 100,
        availableShares: 65,
        minInvestment: "0.05",
        propertyURI: "ipfs://QmXyZ123...",
        isFundingComplete: false,
        createdAt: Date.now() / 1000
      },
      {
        propertyId: 1,
        tokenAddress: "0x2345678901234567890123456789012345678901",
        name: "Beachfront Villa",
        symbol: "BFV",
        propertyValue: "2.3",
        totalShares: 230,
        availableShares: 115,
        minInvestment: "0.2",
        propertyURI: "ipfs://QmAbC456...",
        isFundingComplete: false,
        createdAt: Date.now() / 1000
      },
      {
        propertyId: 2,
        tokenAddress: "0x3456789012345678901234567890123456789012",
        name: "Urban Micro-Loft",
        symbol: "UML",
        propertyValue: "0.75",
        totalShares: 150,
        availableShares: 0,
        minInvestment: "0.075",
        propertyURI: "ipfs://QmDeF789...",
        isFundingComplete: true,
        createdAt: Date.now() / 1000
      }
    ];
  };

  const value = {
    isConnected,
    account,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    loadProperties,
    investInProperty,
    properties,
    getInvestorDetails,
    claimRentalIncome,
    loading,
    error
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
} 