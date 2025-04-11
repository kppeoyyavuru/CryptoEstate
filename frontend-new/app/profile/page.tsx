'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MetaMaskConnect } from '../components/MetaMaskConnect';

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [metamaskWallet, setMetamaskWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isSignedIn) return;
      
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          setUsername(data.username || '');
          setPhoneNumber(data.phoneNumber || '');
          setMetamaskWallet(data.metamaskWallet || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [isSignedIn]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          phoneNumber,
          metamaskWallet,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MetaMask connection
  const handleMetaMaskConnect = (address: string) => {
    setMetamaskWallet(address);
  };

  if (!isLoaded || !isSignedIn) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-gray-600">
              Update your information and connect your crypto wallet
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          
          {message.text && (
            <div className={`p-3 rounded-md mb-4 ${message.type === 'success' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
            </div>

            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your preferred username"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                MetaMask Wallet
              </label>
              {metamaskWallet ? (
                <div className="flex items-center justify-between mb-4 border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-orange-500 rounded-full mr-2"></div>
                    <p className="text-gray-700">Connected: <span className="font-medium">
                      {`${metamaskWallet.substring(0, 6)}...${metamaskWallet.substring(metamaskWallet.length - 4)}`}
                    </span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMetamaskWallet('')}
                    className="text-sm text-orange-600 hover:text-orange-800"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <MetaMaskConnect onConnect={handleMetaMaskConnect} />
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 