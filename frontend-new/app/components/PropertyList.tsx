'use client';

import { useState, useEffect } from 'react';
import { Property } from '../types/property';
import Image from 'next/image';
import Link from 'next/link';
import { getProvider, getPropertyFactoryContract } from '../blockchain/config';
import { ethers } from 'ethers';

const ITEMS_PER_PAGE = 6;

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, [page]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch properties from API (database)
      const response = await fetch(`/api/properties?page=${page}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties from database');
      }
      const data = await response.json();
      const dbProperties = data.properties;

      // Get provider and contract
      const provider = await getProvider();
      const contract = getPropertyFactoryContract(provider);

      // Update properties with blockchain data
      const updatedProperties = await Promise.all(
        dbProperties.map(async (property: Property) => {
          try {
            if (!property.blockchainId) {
              return property;
            }

            const details = await contract.getPropertyDetails(property.blockchainId);
            return {
              ...property,
              propertyValue: ethers.formatEther(details[4]),
              totalShares: details[5].toString(),
              availableShares: details[6].toString(),
              minInvestment: ethers.formatEther(details[7]),
              isFundingComplete: details[9]
            };
          } catch (error) {
            console.error(`Error fetching blockchain data for property ${property.id}:`, error);
            return property;
          }
        })
      );

      setProperties(prev => page === 1 ? updatedProperties : [...prev, ...updatedProperties]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="property-card animate-pulse">
            <div className="bg-gray-200 h-[220px] w-full"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => {
            setPage(1);
            fetchProperties();
          }} 
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (properties.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">No properties available at the moment.</div>
        <p className="text-sm text-gray-500">Please check back later for new properties.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <div key={property.id} className="property-card">
            <div className="relative h-[220px] w-full overflow-hidden">
              <Image
                src={property.image}
                alt={property.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
              />
              {property.isFundingComplete && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                  Funded
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
              <div className="flex justify-between items-center mb-4">
                <div className="text-orange-600 font-medium">{property.propertyValue} ETH</div>
                <div className="text-sm text-gray-500">{property.location}</div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Investment Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ 
                      width: `${property.totalShares && property.availableShares ? 
                        ((Number(property.totalShares) - Number(property.availableShares)) / Number(property.totalShares)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Min Investment</div>
                  <div className="font-medium">{property.minInvestment} ETH</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Available Shares</div>
                  <div className="font-medium">{property.availableShares}/{property.totalShares}</div>
                </div>
              </div>
              <Link 
                href={`/properties/${property.id}`}
                className="btn btn-primary w-full"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="property-card animate-pulse">
              <div className="bg-gray-200 h-[220px] w-full"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {hasMore && !isLoading && properties.length > 0 && (
        <div className="text-center mt-8">
          <button 
            onClick={loadMore}
            className="btn btn-outline"
          >
            Load More Properties
          </button>
        </div>
      )}
    </div>
  );
} 