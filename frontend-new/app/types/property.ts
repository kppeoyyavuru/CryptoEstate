/**
 * Shared property interface for consistent data across components
 */
export interface Property {
  id: string;
  name: string;
  symbol: string;
  propertyValue: number | string;
  totalShares: number | string;
  availableShares: number | string;
  minInvestment: number | string;
  location: string;
  description: string;
  image: string;
  riskLevel: string;
  expectedReturn: string;
  propertyURI: string;
  tokenAddress: string;
  isFundingComplete: boolean;
  createdAt?: Date;
  blockchainId?: number | string;
}

/**
 * Format a numerical ETH value to a string with 3 decimal places
 */
export const formatEth = (value: string | number): string => {
  if (value === undefined || value === null) return '0.000';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toFixed(3);
}; 