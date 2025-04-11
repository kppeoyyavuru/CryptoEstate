'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Property, formatEth } from '../types/property';

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const { isSignedIn } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate percentage of shares sold
  const percentageSold = ((property.totalShares - property.availableShares) / property.totalShares) * 100;

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-56 w-full">
        <Image
          src={property.image}
          alt={property.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute top-4 right-4 bg-white py-1 px-3 rounded-full text-sm font-semibold">
          {property.riskLevel.toLowerCase() === 'low' && <span className="text-orange-600">Low Risk</span>}
          {property.riskLevel.toLowerCase() === 'medium' && <span className="text-yellow-600">Medium Risk</span>}
          {property.riskLevel.toLowerCase() === 'high' && <span className="text-red-600">High Risk</span>}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl mb-1">{property.name}</h3>
          <span className="text-orange-600 font-semibold">{property.expectedReturn}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{property.location}</p>
        
        <p className="text-gray-700 mb-4 line-clamp-2">{property.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Funding Progress</span>
            <span className="font-medium">{percentageSold.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" 
              style={{ width: `${percentageSold}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <p className="text-gray-600">Property Value</p>
            <p className="font-semibold">{formatEth(property.propertyValue)}</p>
          </div>
          <div>
            <p className="text-gray-600">Min. Investment</p>
            <p className="font-semibold">{formatEth(property.minInvestment)}</p>
          </div>
        </div>
        
        <Link 
          href={isSignedIn ? `/invest/${property.id}` : '/sign-in'} 
          className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300"
        >
          {isSignedIn ? 'Invest Now' : 'Sign In to Invest'}
        </Link>
      </div>
    </div>
  );
} 