'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property, formatEth } from '../../types/property';
import { useBlockchain } from '../../blockchain/BlockchainContext';

export default function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, loadProperties, properties: blockchainProperties, loading: blockchainLoading } = useBlockchain();

  useEffect(() => {
    const fetchProperties = async () => {
      if (isConnected) {
        await loadProperties();
      }
    };

    fetchProperties();
  }, [isConnected, loadProperties]);

  useEffect(() => {
    if (blockchainProperties.length > 0) {
      // Map blockchain properties to UI properties
      const uiProperties = blockchainProperties.map((prop: any, index: number) => ({
        id: prop.propertyId.toString(),
        name: prop.name,
        symbol: prop.symbol,
        propertyValue: parseFloat(prop.propertyValue),
        totalShares: prop.totalShares,
        availableShares: prop.availableShares,
        minInvestment: parseFloat(prop.minInvestment),
        propertyURI: prop.propertyURI,
        tokenAddress: prop.tokenAddress,
        isFundingComplete: prop.isFundingComplete,
        location: getMockLocation(index),
        description: getMockDescription(index),
        image: getMockImage(index),
        riskLevel: getMockRiskLevel(index),
        expectedReturn: getMockReturn(index),
        createdAt: prop.createdAt
      }));

      setProperties(uiProperties);
      setIsLoading(false);
    } else if (!blockchainLoading) {
      // If no properties from blockchain, show mock data
      setProperties(getMockProperties());
      setIsLoading(false);
    }
  }, [blockchainProperties, blockchainLoading]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div key={property.id} className="property-card">
          <div className="property-image-container">
            <Image
              src={property.image}
              alt={property.name}
              fill
              className="property-image"
            />
            <div className={`property-risk-badge risk-${property.riskLevel.toLowerCase()}`}>
              {property.riskLevel} Risk
            </div>
          </div>
          
          <div className="property-content">
            <div className="property-header">
              <h3 className="property-title">{property.name}</h3>
              <span className="property-price">{formatEth(property.propertyValue)}</span>
            </div>
            
            <p className="property-location">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-3.5 h-3.5 flex-shrink-0 mr-1"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {property.location}
            </p>
            
            <p className="property-description">{property.description}</p>
            
            <div className="property-details">
              <div className="property-detail">
                <span className="detail-label">Expected Return:</span> 
                <span className="detail-value positive">{property.expectedReturn}</span>
              </div>
              
              <div className="property-detail">
                <span className="detail-label">Min Investment:</span> 
                <span className="detail-value">{formatEth(property.minInvestment)}</span>
              </div>
              
              <div className="property-detail">
                <span className="detail-label">Status:</span> 
                <span className="detail-value">
                  {property.isFundingComplete ? 'Funded' : 'Open for investment'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Link 
                href={`/property/${property.id}`}
                className="btn btn-secondary flex-1 mr-2 text-center"
              >
                Details
              </Link>
              <Link 
                href={`/invest?property=${property.id}`}
                className={`btn ${property.isFundingComplete ? 'btn-secondary opacity-60' : 'btn-primary'} flex-1 text-center`}
                aria-disabled={property.isFundingComplete}
              >
                {property.isFundingComplete ? 'Funded' : 'Invest'}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper functions for mock data
function getMockLocation(index: number): string {
  const locations = [
    "New York, NY",
    "Miami, FL",
    "Chicago, IL",
    "Los Angeles, CA",
    "Dallas, TX"
  ];
  return locations[index % locations.length];
}

function getMockDescription(index: number): string {
  const descriptions = [
    "Prime residential unit in Manhattan's financial district with high rental demand.",
    "Luxurious beachfront property with panoramic ocean views and private access.",
    "Modern micro-apartments in the heart of the city, perfect for young professionals.",
    "Mixed-use development in a rapidly growing urban area with strong rental income.",
    "Commercial office space in a prime location with long-term corporate tenants."
  ];
  return descriptions[index % descriptions.length];
}

function getMockImage(index: number): string {
  const images = [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
  ];
  return images[index % images.length];
}

function getMockRiskLevel(index: number): string {
  const risks = ["Low", "Medium", "High"];
  return risks[index % risks.length];
}

function getMockReturn(index: number): string {
  const returns = ["8-12%", "10-15%", "15-20%"];
  return returns[index % returns.length];
}

// Helper function to get mock properties
function getMockProperties(): Property[] {
  return [
    {
      id: "0",
      name: "Downtown Luxury Apartment",
      symbol: "DLA",
      propertyValue: 0.5,
      totalShares: 100,
      availableShares: 35,
      minInvestment: 0.005,
      location: "New York, NY",
      description: "Prime residential unit in Manhattan's financial district with high rental demand.",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop",
      riskLevel: "Medium",
      expectedReturn: "10-15%",
      propertyURI: "ipfs://QmXyZ123...",
      tokenAddress: "0x1234567890123456789012345678901234567890",
      isFundingComplete: false,
      createdAt: Date.now()
    },
    {
      id: "1",
      name: "Beachfront Villa",
      symbol: "BFV",
      propertyValue: 2.3,
      totalShares: 230,
      availableShares: 115,
      minInvestment: 0.002,
      location: "Miami, FL",
      description: "Luxurious beachfront property with panoramic ocean views and private access.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      riskLevel: "High",
      expectedReturn: "15-20%",
      propertyURI: "ipfs://QmAbC456...",
      tokenAddress: "0x2345678901234567890123456789012345678901",
      isFundingComplete: false,
      createdAt: Date.now()
    },
    {
      id: "2",
      name: "Urban Micro-Loft",
      symbol: "UML",
      propertyValue: 0.75,
      totalShares: 150,
      availableShares: 0,
      minInvestment: 0.001,
      location: "Chicago, IL",
      description: "Modern micro-apartments in the heart of the city, perfect for young professionals.",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
      riskLevel: "Low",
      expectedReturn: "8-12%",
      propertyURI: "ipfs://QmDeF789...",
      tokenAddress: "0x3456789012345678901234567890123456789012",
      isFundingComplete: true,
      createdAt: Date.now()
    }
  ];
} 