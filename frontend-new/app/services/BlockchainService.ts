// Import ethers for blockchain interaction
import { ethers } from 'ethers';

// Set contract addresses (replace with deployed contract address)
const PROPERTY_FACTORY_ADDRESS = '0xec93F3edaE90877Df1259d4DC257bdc882438365'; // Sepolia testnet address

// Define ABIs (normally these would be imported from JSON files)
const PropertyFactoryABI = [
  {
    "inputs": [],
    "name": "getPropertyCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_propertyId",
        "type": "uint256"
      }
    ],
    "name": "investInProperty",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_propertyId",
        "type": "uint256"
      }
    ],
    "name": "getPropertyDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "propertyId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "propertyValue",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalShares",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "availableShares",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minInvestment",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "propertyURI",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isFundingComplete",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct PropertyFactory.Property",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_propertyId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_investor",
        "type": "address"
      }
    ],
    "name": "getInvestorDetails",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "investmentAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "shareCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "ownership",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "unclaimedIncome",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "claimedIncome",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Define the window ethereum property
declare global {
  interface Window {
    ethereum: any;
  }
}

// Map between database UUID and blockchain numeric IDs
const PROPERTY_ID_MAP: Record<string, number> = {
  'c3518e2a-b61a-460d-902a-dfe3c4b886d5': 1, // Urban Micro-Loft
  // Add other property mappings here
};

class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private factoryContract: ethers.Contract | null = null;
  private networkName: string = '';

  constructor() {
    // Initialize will be called when needed
  }

  /**
   * Get blockchain ID from database ID
   * @param databaseId Database UUID or numeric ID
   * @returns Numeric blockchain ID
   */
  private getBlockchainId(databaseId: string | number): number {
    // If it's already a number, return it
    if (typeof databaseId === 'number') {
      return databaseId;
    }
    
    // If it's a string that's numeric, convert and return
    if (databaseId && !isNaN(Number(databaseId))) {
      return Number(databaseId);
    }
    
    // If it's a UUID, check the mapping
    if (PROPERTY_ID_MAP[databaseId]) {
      return PROPERTY_ID_MAP[databaseId];
    }
    
    // Default to ID 0 (which will likely fail gracefully) and log warning
    console.warn(`Could not find blockchain ID for ${databaseId}, using default`);
    return 0;
  }

  /**
   * Test if contract is properly deployed
   */
  async testContract() {
    if (!this.provider || !this.factoryContract) {
      await this.initialize();
    }

    try {
      // Try to get the property count
      const count = await this.factoryContract!.getPropertyCount();
      console.log('Contract test successful, property count:', count.toString());
      return true;
    } catch (error) {
      console.error('Contract test failed:', error);
      return false;
    }
  }

  /**
   * Initialize the blockchain service
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
      }
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get network information
      const network = await this.provider.getNetwork();
      this.networkName = network.name;
      
      // Check if on the right network (Sepolia for testing)
      if (network.chainId !== 11155111n) {
        console.warn(`Connected to ${network.name} (${network.chainId}), not Sepolia. Some features may not work.`);
      }
      
      // Request accounts (this will prompt user if not already connected)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect MetaMask.');
      }
      
      // Get signer
      this.signer = await this.provider.getSigner();
      
      // Initialize factory contract
      this.factoryContract = new ethers.Contract(
        PROPERTY_FACTORY_ADDRESS,
        PropertyFactoryABI,
        this.signer
      );

      // Test the contract
      const contractTest = await this.testContract();
      if (!contractTest) {
        throw new Error('Contract test failed. Please ensure the contract is properly deployed.');
      }
      
      console.log('BlockchainService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Invest in a property
   * @param id Property ID (database or blockchain)
   * @param amount Amount in ETH to invest
   * @returns Transaction hash
   */
  async investInProperty(id: string | number, amount: number): Promise<string> {
    if (!this.provider || !this.factoryContract) {
      await this.initialize();
    }

    try {
      // Get the blockchain ID
      const blockchainId = this.getBlockchainId(id);
      console.log(`Investing in property ID ${blockchainId} with ${amount} ETH`);
      
      // Convert ETH to Wei
      const weiAmount = ethers.parseEther(amount.toString());
      
      // Send the transaction
      const tx = await this.factoryContract!.investInProperty(blockchainId, {
        value: weiAmount
      });
      
      console.log(`Investment transaction sent: ${tx.hash}`);
      
      // Wait for transaction to be mined
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      console.log(`Investment confirmed in block ${receipt.blockNumber}`);
      return tx.hash;
    } catch (error: any) {
      console.error('Error investing in property:', error);
      
      // Check for common errors
      if (error.message?.includes('user rejected')) {
        throw new Error('Transaction rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds in your wallet');
      } else if (error.message?.includes('Property does not exist')) {
        throw new Error('Property not found on blockchain');
      } else if (error.message?.includes('Property funding is complete')) {
        throw new Error('Property funding is already complete');
      }
      
      throw new Error(`Investment failed: ${error.message}`);
    }
  }

  /**
   * Get property details from the blockchain
   * @param id Database ID or blockchain ID
   * @returns Property details object
   */
  async getPropertyDetails(id: string | number) {
    if (!this.provider || !this.factoryContract) {
      await this.initialize();
    }

    try {
      // Convert database ID to blockchain ID if needed
      const blockchainId = this.getBlockchainId(id);
      console.log(`Getting property details for blockchain ID: ${blockchainId}`);
      
      // Call the contract method
      const details = await this.factoryContract!.getPropertyDetails(blockchainId);
      
      // Format the result
      return {
        blockchainId: details.propertyId.toString(),
        tokenAddress: details.tokenAddress,
        name: details.name,
        symbol: details.symbol,
        propertyValue: ethers.formatEther(details.propertyValue),
        totalShares: details.totalShares.toString(),
        availableShares: details.availableShares.toString(),
        minInvestment: ethers.formatEther(details.minInvestment),
        propertyURI: details.propertyURI,
        isFundingComplete: details.isFundingComplete,
        createdAt: new Date(Number(details.createdAt) * 1000).toISOString()
      };
    } catch (error: any) {
      console.error('Error getting property details:', error);
      if (error.message?.includes('could not decode result data')) {
        throw new Error('Contract not properly deployed or property ID not found');
      }
      throw new Error(`Failed to get property details: ${error.message}`);
    }
  }

  /**
   * Get investor details for a property
   * @param databaseId The database property ID
   * @param investor The investor address
   * @returns Investor details for the property
   */
  async getInvestorDetails(databaseId: string, investor: string) {
    if (!this.provider || !this.factoryContract) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize blockchain service');
      }
    }

    try {
      // Get blockchain ID from database ID
      const blockchainId = this.getBlockchainId(databaseId);
      if (blockchainId === null) {
        throw new Error(`Property ID ${databaseId} not found on blockchain`);
      }
      
      const details = await this.factoryContract!.getInvestorDetails(blockchainId, investor);
      
      return {
        investmentAmount: ethers.formatEther(details.investmentAmount),
        shareCount: details.shareCount.toString(),
        ownership: details.ownership.toString(),
        unclaimedIncome: ethers.formatEther(details.unclaimedIncome),
        claimedIncome: ethers.formatEther(details.claimedIncome)
      };
    } catch (error) {
      console.error('Error getting investor details:', error);
      throw error;
    }
  }
  
  /**
   * Get current network info
   * @returns Network information
   */
  async getNetworkInfo() {
    if (!this.provider) {
      await this.initialize();
    }
    
    try {
      const network = await this.provider!.getNetwork();
      return {
        name: network.name,
        chainId: network.chainId.toString(),
        isTestnet: network.name !== 'mainnet'
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      throw error;
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export default blockchainService; 