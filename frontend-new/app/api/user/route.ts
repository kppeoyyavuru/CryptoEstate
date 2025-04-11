import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/prisma/client';

// Mock user data - only used if database connection fails
let mockUser = {
  id: 'mock-user-id',
  clerkId: '',
  email: '',
  username: '',
  phoneNumber: '',
  metamaskWallet: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from request body
    const { username, phoneNumber, metamaskWallet } = await request.json();

    try {
      // Check if user already exists in our database
      let dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id }
      });

      if (dbUser) {
        // Update existing user
        dbUser = await prisma.user.update({
          where: { clerkId: user.id },
          data: {
            username: username || dbUser.username,
            phoneNumber: phoneNumber || dbUser.phoneNumber,
            metamaskWallet: metamaskWallet || dbUser.metamaskWallet,
          }
        });
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            username: username || '',
            phoneNumber: phoneNumber || '',
            metamaskWallet: metamaskWallet || '',
          }
        });
      }

      return NextResponse.json(dbUser, { status: 200 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fall back to mock data if database connection fails
      mockUser = {
        ...mockUser,
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        username: username || mockUser.username,
        phoneNumber: phoneNumber || mockUser.phoneNumber,
        metamaskWallet: metamaskWallet || mockUser.metamaskWallet,
        updatedAt: new Date()
      };
      
      return NextResponse.json(mockUser, { status: 200 });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Get user from our database
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id }
      });

      if (!dbUser) {
        // Return clerk user data if not in database yet
        return NextResponse.json({ 
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          username: '',
          phoneNumber: '',
          metamaskWallet: ''
        });
      }

      return NextResponse.json(dbUser, { status: 200 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fall back to mock data if database connection fails
      if (mockUser.clerkId !== user.id) {
        mockUser = {
          ...mockUser,
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || ''
        };
      }
      
      return NextResponse.json(mockUser, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 