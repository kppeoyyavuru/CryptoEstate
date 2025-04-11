'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import MetaMaskConnect from './MetaMaskConnect';
import { Property, formatEth } from '../types/property';
import blockchainService from '../services/BlockchainService';
import { ethers } from 'ethers';
import { getProvider, getPropertyTokenContract, PROPERTY_FACTORY_ADDRESS, PROPERTY_FACTORY_ABI } from '@/app/blockchain/config';

interface PropertyInvestmentProps {
  property: Property;
}

export default function PropertyInvestment({ property }: PropertyInvestmentProps) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [investmentAmount, setInvestmentAmount] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [blockchainProperty, setBlockchainProperty] = useState<any>(null);
  const [isLoadingBlockchain, setIsLoadingBlockchain] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{name: string, chainId: string, isTestnet: boolean} | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'waiting' | 'processing' | 'success' | 'error'>('idle');
  const [fundingPercentage, setFundingPercentage] = useState(0);

  useEffect(() => {
    // Convert totalShares and availableShares to numbers to ensure proper calculation
    const totalShares = typeof property.totalShares === 'string' 
      ? parseFloat(property.totalShares) 
      : property.totalShares;
      
    const availableShares = typeof property.availableShares === 'string'
      ? parseFloat(property.availableShares)
      : property.availableShares;
      
    const percentage = ((totalShares - availableShares) / totalShares) * 100;
    setFundingPercentage(percentage);
  }, [property]);

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const provider = await getProvider();
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
      } catch (err) {
        console.error('Failed to connect wallet:', err);
        setError('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
      }
    };
    if (isSignedIn) {
      connectWallet();
    }
  }, [isSignedIn]);

  // Load network info on mount
  useEffect(() => {
    async function loadNetworkInfo() {
      try {
        const networkData = await blockchainService.getNetworkInfo();
        setNetworkInfo(networkData);
      } catch (error) {
        console.log('Network not connected yet');
      }
    }
    
    loadNetworkInfo();
  }, [account]);

  // When account is connected, load blockchain data
  useEffect(() => {
    if (account) {
      console.log('Account connected, loading blockchain data:', account);
      console.log('Current property:', property);
      loadBlockchainData();
    } else {
      console.log('No account connected yet');
    }
  }, [account, property.id]);

  const loadBlockchainData = async () => {
    try {
      setIsLoadingBlockchain(true);
      setError(null);
      
      // Initialize blockchain service
      await blockchainService.initialize();
      
      // Try to get property details from blockchain
      try {
        // First get the blockchain property ID from the database property
        const blockchainId = property.blockchainId || property.id;
        console.log('Using blockchain ID:', blockchainId);
        
        if (!blockchainId) {
          throw new Error('Property not found on blockchain');
        }

        // Get property details using the blockchain ID
        const onchainProperty = await blockchainService.getPropertyDetails(blockchainId);
        if (!onchainProperty) {
          throw new Error('Property not found on blockchain');
        }

        setBlockchainProperty(onchainProperty);
        console.log('Blockchain property data:', onchainProperty);
      } catch (err: any) {
        console.warn('Error loading blockchain property:', err);
        if (err.message?.includes('could not decode result data')) {
          setError('Contract not properly deployed. Please ensure the contract is deployed and the address is correct.');
        } else {
          setError('Property not found on blockchain. Please try again later.');
        }
      }
    } catch (err: any) {
      console.error('Error loading blockchain data:', err);
      if (err.message?.includes('MetaMask not installed')) {
        setError('MetaMask not installed. Please install MetaMask to invest.');
      } else if (err.message?.includes('Contract test failed')) {
        setError('Contract not properly deployed. Please ensure the contract is deployed and the address is correct.');
      } else {
        setError('Failed to connect to blockchain. Please try again later.');
      }
    } finally {
      setIsLoadingBlockchain(false);
    }
  };

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value))) {
      setInvestmentAmount(value);
      setError(null);
    }
  };

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!blockchainProperty?.propertyId) {
      setError('Property not found on blockchain. Please try again later.');
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (amount < parseFloat(String(property.minInvestment))) {
      setError(`Minimum investment is ${formatEth(property.minInvestment)} ETH`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Get provider and property token contract
      const provider = await getProvider();
      const factoryContract = new ethers.Contract(
        PROPERTY_FACTORY_ADDRESS,
        PROPERTY_FACTORY_ABI,
        provider
      ).connect(await provider.getSigner()) as ethers.Contract & {
        investInProperty: (propertyId: number, options: { value: bigint }) => Promise<ethers.ContractTransactionResponse>;
      };
      
      // Convert investment amount to Wei
      const investmentAmountWei = ethers.parseEther(investmentAmount);

      // Use the blockchain ID from the blockchainProperty
      const blockchainId = Number(blockchainProperty.propertyId);
      console.log('Investing in blockchain property ID:', blockchainId);

      // Call the invest function with the blockchain property ID
      const tx = await factoryContract.investInProperty(blockchainId, {
        value: investmentAmountWei
      });

      // Wait for transaction confirmation
      await tx.wait();

      // Record investment in database
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          amount: investmentAmount,
          walletAddress: account
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record investment');
      }

      setSuccess('Investment successful!');
      // Refresh property data
      loadBlockchainData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Investment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">Please sign in to invest in this property.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Property Image */}
          <div className="md:w-1/2">
            <div className="h-64 md:h-full w-full relative">
              <img 
                src={property.image || '/placeholder-property.jpg'} 
                alt={property.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">{property.name}</h1>
                <p className="text-gray-600 mb-2">{property.location}</p>
              </div>
              <div className="px-3 py-1 rounded bg-orange-100 text-orange-800 text-sm font-medium">
                {property.symbol}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">{property.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Property Value</p>
                  <p className="text-lg font-bold">{formatEth(property.propertyValue)} ETH</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Minimum Investment</p>
                  <p className="text-lg font-bold">{formatEth(property.minInvestment)} ETH</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Risk Level</p>
                  <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block
                    ${property.riskLevel.toLowerCase() === 'low' ? 'bg-green-100 text-green-800' : 
                      property.riskLevel.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {property.riskLevel}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Expected Return</p>
                  <p className="text-lg font-medium text-orange-600">{property.expectedReturn}</p>
                </div>
              </div>

              {/* Network Info */}
              {networkInfo && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <h3 className="text-xs font-semibold text-blue-800 mb-1">Network Information</h3>
                  <p className="text-xs text-blue-700">
                    Connected to: <span className="font-medium">{networkInfo.name}</span>
                    {!networkInfo.isTestnet && (
                      <span className="block text-red-600 font-medium mt-1">⚠️ Please switch to Sepolia testnet</span>
                    )}
                  </p>
                </div>
              )}

              {/* Blockchain Status */}
              {isLoadingBlockchain && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading blockchain data...
                </div>
              )}
              
              {blockchainProperty && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-sm font-semibold text-green-800 mb-1">Blockchain Property Details</h3>
                  <div className="text-xs text-green-700">
                    <p>Token Address: {blockchainProperty.tokenAddress.substring(0, 8)}...</p>
                    <p>Available Shares: {blockchainProperty.availableShares}</p>
                    <p>Blockchain ID: {blockchainProperty.blockchainId}</p>
                  </div>
                </div>
              )}

              {/* Funding Progress */}
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 text-sm">Funding Progress</span>
                  <span className="text-sm font-medium">{fundingPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2.5 rounded-full" 
                    style={{ width: `${fundingPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{formatEth(Number(property.propertyValue) - (Number(property.availableShares) * Number(property.minInvestment)))} ETH raised</span>
                  <span>{formatEth(property.propertyValue)} ETH goal</span>
                </div>
              </div>

              {/* Investment Form */}
              <form onSubmit={handleInvestmentSubmit}>
                <div className="mb-4">
                  <label htmlFor="investment" className="block text-gray-700 font-medium mb-2">
                    Investment Amount (ETH)
                  </label>
                  <input
                    type="number"
                    id="investment"
                    value={investmentAmount}
                    onChange={handleInvestmentChange}
                    step="0.001"
                    min={property.minInvestment}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter amount in ETH"
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !account}
                  className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-orange-600 hover:to-orange-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Invest Now'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 