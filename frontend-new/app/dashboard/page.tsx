'use client';

import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Property } from '../types/property';

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [investments, setInvestments] = useState<any[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [loading, setLoading] = useState(true);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  // Fetch user investments
  useEffect(() => {
    async function fetchInvestments() {
      if (!isSignedIn) return;
      
      try {
        const response = await fetch('/api/investments');
        if (!response.ok) {
          throw new Error('Failed to fetch investments');
        }
        const data = await response.json();
        // If the API returns an error object (which happens when user has no investments)
        // set investments to an empty array
        setInvestments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading investments:', error);
        // Ensure investments is an empty array if there's an error
        setInvestments([]);
      }
    }

    // Fetch all properties to match with investments
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        
        // Convert array to object with id as key for easy lookup
        const propertiesMap = data.reduce((acc: Record<string, Property>, property: Property) => {
          acc[property.id] = property;
          return acc;
        }, {});
        
        setProperties(propertiesMap);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvestments();
    fetchProperties();
  }, [isSignedIn]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link 
            href="/invest" 
            className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition"
          >
            Explore Investments
          </Link>
          <Link 
            href="/profile" 
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition"
          >
            View Profile
          </Link>
          <UserButton />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user?.firstName || 'Investor'}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800">Total Investments</h3>
            <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800">Total Value</h3>
            <p className="text-2xl font-bold text-gray-900">
              {investments.length > 0 
                ? investments.reduce((total, inv) => total + (inv.amountInvested || 0), 0).toFixed(3)
                : "0.000"} ETH
            </p>
          </div>
          <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800">Properties</h3>
            <p className="text-2xl font-bold text-gray-900">
              {investments.length > 0 
                ? new Set(investments.map(inv => inv.propertyId)).size
                : 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">My Investments</h2>
        
        {investments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You haven't made any investments yet.</p>
            <Link 
              href="/invest" 
              className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-3 px-4 text-left">Property</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Investment Amount</th>
                  <th className="py-3 px-4 text-left">Investment Date</th>
                  <th className="py-3 px-4 text-left">Transaction</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => {
                  const property = properties[investment.propertyId];
                  return (
                    <tr key={investment.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {property ? (
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                              <img 
                                src={property.image || '/placeholder-property.jpg'} 
                                alt={property.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{property.name}</p>
                              <p className="text-sm text-gray-500">{property.symbol}</p>
                            </div>
                          </div>
                        ) : (
                          <p>Property not found</p>
                        )}
                      </td>
                      <td className="py-3 px-4">{property?.location || 'N/A'}</td>
                      <td className="py-3 px-4 font-medium">{investment.amountInvested.toFixed(3)} ETH</td>
                      <td className="py-3 px-4">
                        {new Date(investment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {investment.transactionHash ? (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${investment.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-xs truncate block"
                            title={investment.transactionHash}
                          >
                            {investment.transactionHash.substring(0, 10)}...
                          </a>
                        ) : (
                          <span className="text-gray-400">No hash</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {property && (
                          <Link 
                            href={`/invest/${property.id}`}
                            className="text-orange-500 hover:text-orange-700"
                          >
                            View Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 