import { ethers } from 'ethers';

// Contract addresses from deployment
const CONTRACT_ADDRESSES = {
  propertyFactory: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // This will be the local deployment address
};

// Network configuration
const NETWORK_CONFIG = {
  chainId: 31337, // Hardhat's default chainId
  chainName: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
};

// Contract ABIs
const PROPERTY_FACTORY_ABI = [
  "function createProperty(string name, string symbol, uint256 propertyValue, uint256 totalShares, uint256 minInvestment, string propertyURI) external returns (uint256, address)",
  "function properties(uint256) external view returns (address)",
  "function propertyIdToToken(uint256) external view returns (address)",
  "function investInProperty(uint256 _propertyId) external payable",
  "function getPropertyCount() external view returns (uint256)",
  "function getPropertyDetails(uint256 propertyId) external view returns (uint256, address, string, string, uint256, uint256, uint256, uint256, string, bool, uint256)"
];

const PROPERTY_TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function propertyId() external view returns (uint256)",
  "function propertyValue() external view returns (uint256)",
  "function totalShares() external view returns (uint256)",
  "function availableShares() external view returns (uint256)",
  "function minInvestment() external view returns (uint256)",
  "function propertyURI() external view returns (string)",
  "function isFundingComplete() external view returns (bool)",
  "function invest() external payable",
  "function getInvestorShares(address investor) external view returns (uint256)"
];

// Contract addresses (replace with your deployed contract addresses)
const PROPERTY_FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // This will be the local deployment address

async function getProvider() {
  // Check if window.ethereum is available (MetaMask is installed)
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== '0x' + NETWORK_CONFIG.chainId.toString(16)) {
        try {
          // Try to switch to the correct network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + NETWORK_CONFIG.chainId.toString(16) }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x' + NETWORK_CONFIG.chainId.toString(16),
                  chainName: NETWORK_CONFIG.chainName,
                  rpcUrls: [NETWORK_CONFIG.rpcUrl],
                  nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                },
              ],
            });
          }
        }
      }
      
      return new ethers.BrowserProvider(window.ethereum);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      // Fallback to local provider if MetaMask connection fails
      return new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    }
  }
  
  // Fallback to local provider if MetaMask is not available
  return new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
}

function getPropertyFactoryContract(provider: ethers.Provider) {
  return new ethers.Contract(PROPERTY_FACTORY_ADDRESS, PROPERTY_FACTORY_ABI, provider);
}

function getPropertyTokenContract(propertyAddress: string, provider: ethers.Provider) {
  return new ethers.Contract(propertyAddress, PROPERTY_TOKEN_ABI, provider);
}

// Types for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export {
  CONTRACT_ADDRESSES,
  NETWORK_CONFIG,
  PROPERTY_FACTORY_ABI,
  PROPERTY_TOKEN_ABI,
  PROPERTY_FACTORY_ADDRESS,
  getProvider,
  getPropertyFactoryContract,
  getPropertyTokenContract
}; 