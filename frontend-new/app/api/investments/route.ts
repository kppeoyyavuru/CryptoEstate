import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';
import { auth } from '@clerk/nextjs';
import { getServerProvider, getPropertyTokenContract } from '@/app/blockchain/config';
import { ethers } from 'ethers';

// Define interfaces to help with types
interface PropertyFromDB {
  id: string;
  name: string;
  symbol: string;
  propertyValue: number;
  totalShares: number;
  availableShares: number;
  minInvestment: number;
  location: string;
  description: string;
  image: string;
  riskLevel: string;
  expectedReturn: string;
  propertyURI: string | null;
  tokenAddress: string | null;
  isFundingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface InvestmentFromDB {
  id: string;
  userId: string;
  propertyId: string;
  amountInvested: number;
  walletAddress: string;
  transactionHash?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET user investments
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // Get all properties
    const properties = await prisma.property.findMany();
    
    // Get investments from blockchain for each property
    const investments = [];
    const provider = getServerProvider();

    for (const property of properties) {
      try {
        const contract = getPropertyTokenContract(property.id, provider);
        const investment = await contract.getInvestment(user.metamaskWallet);
        
        if (investment.amount > 0) {
          // Update or create investment in database
          const dbInvestment = await prisma.investment.upsert({
            where: {
              userId_propertyId: {
                userId: user.id,
                propertyId: property.id
              }
            },
            update: {
              amountInvested: Number(ethers.formatEther(investment.amount)),
              shares: Number(investment.shares),
              status: 'COMPLETED'
            },
            create: {
              userId: user.id,
              propertyId: property.id,
              amountInvested: Number(ethers.formatEther(investment.amount)),
              shares: Number(investment.shares),
              walletAddress: user.metamaskWallet,
              status: 'COMPLETED'
            }
          });

          // Update property available shares in database
          const propertyDetails = await contract.getPropertyDetails();
          await prisma.property.update({
            where: { id: property.id },
            data: {
              availableShares: Number(propertyDetails._availableShares),
              isFundingComplete: propertyDetails._isFundingComplete
            }
          });

          investments.push({
            ...dbInvestment,
            property
          });
        }
      } catch (error) {
        console.error(`Error fetching investment for property ${property.id}:`, error);
      }
    }

    return NextResponse.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}

// CREATE a new investment
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { propertyId, amount, walletAddress, transactionHash } = await req.json();
    
    if (!propertyId || !amount || !walletAddress) {
      return NextResponse.json(
        { error: 'Property ID, amount, and wallet address are required' },
        { status: 400 }
      );
    }

    // Get user from database or create if not exists
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          metamaskWallet: walletAddress
        }
      });
    }

    // Create pending investment in database
    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        propertyId,
        amountInvested: Number(amount),
        walletAddress,
        transactionHash,
        status: 'PENDING'
      }
    });

    // Get contract and verify investment
    const provider = getServerProvider();
    const contract = getPropertyTokenContract(propertyId, provider);
    
    try {
      // Wait for transaction to be mined
      if (transactionHash) {
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (receipt && receipt.status === 1) {
          // Get investment details from contract
          const contractInvestment = await contract.getInvestment(walletAddress);
          
          // Update investment in database
          const updatedInvestment = await prisma.investment.update({
            where: { id: investment.id },
            data: {
              shares: Number(contractInvestment.shares),
              status: 'COMPLETED'
            }
          });

          // Update property available shares
          const propertyDetails = await contract.getPropertyDetails();
          await prisma.property.update({
            where: { id: propertyId },
            data: {
              availableShares: Number(propertyDetails._availableShares),
              isFundingComplete: propertyDetails._isFundingComplete
            }
          });

          return NextResponse.json(updatedInvestment);
        }
      }
    } catch (error) {
      console.error('Error verifying investment:', error);
    }

    return NextResponse.json(investment);
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    );
  }
} 