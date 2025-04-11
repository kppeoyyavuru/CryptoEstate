/**
 * Mock Blockchain Contract Implementation
 * 
 * This file simulates a blockchain contract interaction for local testing,
 * so the application can be tested without an actual blockchain connection.
 */

// Mock property data mimicking blockchain data
interface MockBlockchainProperty {
  propertyId: number;
  tokenAddress: string;
  name: string;
  symbol: string;
  propertyValue: bigint;
  totalShares: bigint;
  availableShares: bigint;
  minInvestment: bigint;
  propertyURI: string;
  isFundingComplete: boolean;
  createdAt: bigint;
}

// Mock investor data mimicking blockchain data
interface MockInvestorDetails {
  investmentAmount: bigint;
  shareCount: bigint;
  ownership: bigint;
  unclaimedIncome: bigint;
  claimedIncome: bigint;
}

// Generate a mock token address
const generateTokenAddress = (id: number): string => {
  return `0x${id}${'0'.repeat(39)}`;
};

// Convert ETH to Wei (as bigint)
const ethToWei = (ethAmount: number): bigint => {
  return BigInt(Math.floor(ethAmount * 10**18));
};

// Convert property from DB format to blockchain format
const createMockBlockchainProperty = (
  id: number, 
  name: string, 
  symbol: string, 
  propertyValue: number,
  totalShares: number,
  availableShares: number,
  minInvestment: number
): MockBlockchainProperty => {
  return {
    propertyId: id,
    tokenAddress: generateTokenAddress(id),
    name,
    symbol,
    propertyValue: ethToWei(propertyValue),
    totalShares: BigInt(totalShares),
    availableShares: BigInt(availableShares),
    minInvestment: ethToWei(minInvestment),
    propertyURI: `ipfs://QmW8jbKmUQ6tTtGD6U61HfkVdBFPcPZJxj2JpGUFz1vpTR/${id}`,
    isFundingComplete: availableShares === 0,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * id) // Different creation dates
  };
};

// Mock data store
const mockProperties: Record<number, MockBlockchainProperty> = {
  1: createMockBlockchainProperty(1, "Luxury Apartment Complex", "LUXAPT", 3.5, 1000, 800, 0.001),
  2: createMockBlockchainProperty(2, "Commercial Office Space", "COMOFF", 5.2, 1500, 1200, 0.001),
  3: createMockBlockchainProperty(3, "Residential Duplex", "RESDPX", 1.8, 800, 500, 0.001),
  4: createMockBlockchainProperty(4, "Vacation Rental Property", "VACRNT", 2.3, 700, 700, 0.001),
};

// Map of investments: propertyId -> wallet -> investment
const mockInvestments: Record<number, Record<string, MockInvestorDetails>> = {};

export class MockContract {
  /**
   * Get property details from the mock blockchain
   * @param propertyId The numeric property ID
   * @returns Promise with property details
   */
  async getPropertyDetails(propertyId: number): Promise<MockBlockchainProperty> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Check if property exists
    if (!mockProperties[propertyId]) {
      throw new Error(`Property with ID ${propertyId} not found on blockchain`);
    }
    
    return mockProperties[propertyId];
  }
  
  /**
   * Invest in a property on the mock blockchain
   * @param propertyId The property ID
   * @param amount The investment amount in ETH
   * @param wallet The wallet address investing
   * @returns Promise with transaction hash
   */
  async investInProperty(propertyId: number, amount: number, wallet: string): Promise<string> {
    // Simulate network delay and transaction time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Check if property exists
    if (!mockProperties[propertyId]) {
      throw new Error(`Property with ID ${propertyId} not found on blockchain`);
    }
    
    const property = mockProperties[propertyId];
    
    // Check if property has available shares
    if (property.availableShares <= BigInt(0)) {
      throw new Error('This property has no available shares left');
    }
    
    // Convert amount to Wei
    const amountInWei = ethToWei(amount);
    
    // Check minimum investment
    if (amountInWei < property.minInvestment) {
      throw new Error(`Investment amount must be at least ${property.minInvestment} wei`);
    }
    
    // Calculate share count based on investment amount
    const sharePrice = property.propertyValue / property.totalShares;
    const shareCount = amountInWei / sharePrice;
    
    // Update available shares
    const newAvailableShares = property.availableShares - shareCount;
    if (newAvailableShares < BigInt(0)) {
      throw new Error('Not enough shares available for this investment amount');
    }
    
    property.availableShares = newAvailableShares;
    property.isFundingComplete = newAvailableShares === BigInt(0);
    
    // Record investment
    if (!mockInvestments[propertyId]) {
      mockInvestments[propertyId] = {};
    }
    
    // Add to existing investment if any
    const existingInvestment = mockInvestments[propertyId][wallet];
    if (existingInvestment) {
      existingInvestment.investmentAmount += amountInWei;
      existingInvestment.shareCount += shareCount;
      existingInvestment.ownership = (existingInvestment.shareCount * BigInt(10000)) / property.totalShares;
    } else {
      mockInvestments[propertyId][wallet] = {
        investmentAmount: amountInWei,
        shareCount,
        ownership: (shareCount * BigInt(10000)) / property.totalShares, // Basis points (100% = 10000)
        unclaimedIncome: BigInt(0),
        claimedIncome: BigInt(0)
      };
    }
    
    // Generate mock transaction hash
    const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    return txHash;
  }
  
  /**
   * Get investor details for a property
   * @param propertyId The property ID
   * @param wallet The investor wallet address
   * @returns Promise with investor details
   */
  async getInvestorDetails(propertyId: number, wallet: string): Promise<MockInvestorDetails> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    // Check if property exists
    if (!mockProperties[propertyId]) {
      throw new Error(`Property with ID ${propertyId} not found on blockchain`);
    }
    
    // Check if investor has investment in this property
    if (!mockInvestments[propertyId] || !mockInvestments[propertyId][wallet]) {
      return {
        investmentAmount: BigInt(0),
        shareCount: BigInt(0),
        ownership: BigInt(0),
        unclaimedIncome: BigInt(0),
        claimedIncome: BigInt(0)
      };
    }
    
    return mockInvestments[propertyId][wallet];
  }
}

// Export singleton instance
export const mockContract = new MockContract();

export default mockContract; 