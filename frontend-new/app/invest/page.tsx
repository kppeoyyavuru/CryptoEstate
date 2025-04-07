import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Mock data for investment opportunities
const investmentOpportunities = [
  {
    id: 1,
    title: "Downtown Luxury Apartment",
    price: "0.5 ETH",
    expectedReturn: "12%",
    location: "New York, NY",
    riskLevel: "Medium",
    minInvestment: "0.05 ETH",
    description: "Prime residential unit in Manhattan's financial district with high rental demand.",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Beachfront Villa",
    price: "2.3 ETH",
    expectedReturn: "15%",
    location: "Miami, FL",
    riskLevel: "High",
    minInvestment: "0.2 ETH",
    description: "Luxurious beachfront property with panoramic ocean views and private access.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Urban Micro-Loft",
    price: "0.75 ETH",
    expectedReturn: "10%",
    location: "Chicago, IL",
    riskLevel: "Low",
    minInvestment: "0.075 ETH",
    description: "Modern micro-apartments in the heart of the city, perfect for young professionals.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Commercial Office Space",
    price: "3.2 ETH",
    expectedReturn: "14%",
    location: "San Francisco, CA",
    riskLevel: "Medium",
    minInvestment: "0.3 ETH",
    description: "Prime commercial real estate in the tech hub with stable long-term tenants.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Lakefront Cottage",
    price: "1.2 ETH",
    expectedReturn: "9%",
    location: "Seattle, WA",
    riskLevel: "Low",
    minInvestment: "0.1 ETH",
    description: "Charming cottage with private lake access and year-round rental appeal.",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Retail Shopping Center",
    price: "7.5 ETH",
    expectedReturn: "18%",
    location: "Denver, CO",
    riskLevel: "High",
    minInvestment: "0.75 ETH",
    description: "Established retail center with long-term tenants and strong cash flow.",
    image: "https://images.unsplash.com/photo-1555652736-e92021d28a39?q=80&w=2070&auto=format&fit=crop"
  }
];

export default async function InvestPage() {
  // Check if user is authenticated
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Mock user investment data
  const userInvestments = {
    totalInvested: "1.45 ETH",
    portfolioValue: "1.72 ETH",
    returns: "+18.6%",
    properties: 3
  };

  return (
    <div className="invest-page">
      {/* Navigation */}
      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-icon"></span>
            CryptoEstates
          </Link>
          
          <div className="nav-links">
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/invest" className="nav-link active">Invest</Link>
            <Link href="/portfolio" className="nav-link">Portfolio</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Hero Section */}
        <div className="invest-hero">
          <div className="invest-hero-content">
            <h1 className="invest-hero-title">Tokenized Real Estate Investment</h1>
            <p className="invest-hero-subtitle">
              Invest in premium properties with as little as 0.05 ETH. Get started with these curated opportunities.
            </p>
          </div>
        </div>

        {/* User Investment Summary */}
        <div className="investment-summary">
          <h2 className="summary-title">Your Investment Summary</h2>
          <div className="summary-stats">
            <div className="summary-stat">
              <p className="stat-label">Total Invested</p>
              <p className="stat-value">{userInvestments.totalInvested}</p>
            </div>
            
            <div className="summary-stat">
              <p className="stat-label">Portfolio Value</p>
              <p className="stat-value">{userInvestments.portfolioValue}</p>
            </div>
            
            <div className="summary-stat">
              <p className="stat-label">Returns</p>
              <p className="stat-value positive">{userInvestments.returns}</p>
            </div>
            
            <div className="summary-stat">
              <p className="stat-label">Properties</p>
              <p className="stat-value">{userInvestments.properties}</p>
            </div>
          </div>
        </div>

        <h2 className="section-title">Available Investment Opportunities</h2>
        
        <div className="properties-grid">
          {investmentOpportunities.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-image-container">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="property-image"
                />
                <div className={`property-risk-badge risk-${property.riskLevel.toLowerCase()}`}>
                  {property.riskLevel} Risk
                </div>
              </div>
              
              <div className="property-content">
                <div className="property-header">
                  <h3 className="property-title">{property.title}</h3>
                  <span className="property-price">{property.price}</span>
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
                    className="w-3.5 h-3.5 flex-shrink-0"
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
                    <span className="detail-label">Min:</span> {property.minInvestment}
                  </div>
                </div>
                
                <div className="property-actions">
                  <button className="btn btn-primary flex-1">Invest Now</button>
                  <button className="btn btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to get color based on risk level
function getRiskColor(risk: string) {
  switch (risk) {
    case 'Low':
      return '#10B981'; // green
    case 'Medium':
      return '#F59E0B'; // amber
    case 'High':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
} 