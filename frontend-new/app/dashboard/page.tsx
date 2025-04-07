import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Mock user investment data
const userInvestments = {
  totalInvested: "1.45 ETH",
  portfolioValue: "1.72 ETH",
  returns: "+18.6%",
  returnColor: "#10B981", // green for positive returns
  properties: 3,
  recentActivity: [
    {
      id: 1,
      type: "investment",
      property: "Downtown Luxury Apartment",
      amount: "0.5 ETH",
      date: "2023-06-15",
      status: "completed"
    },
    {
      id: 2,
      type: "dividend",
      property: "Beachfront Villa",
      amount: "0.015 ETH",
      date: "2023-06-01",
      status: "completed"
    },
    {
      id: 3,
      type: "investment",
      property: "Urban Micro-Loft",
      amount: "0.2 ETH",
      date: "2023-05-22",
      status: "completed"
    }
  ],
  ownedProperties: [
    {
      id: 1,
      title: "Downtown Luxury Apartment",
      ownership: "35%",
      currentValue: "0.6 ETH",
      purchaseValue: "0.5 ETH",
      return: "+20%",
      location: "New York, NY",
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Beachfront Villa",
      ownership: "8%",
      currentValue: "0.22 ETH",
      purchaseValue: "0.2 ETH",
      return: "+10%",
      location: "Miami, FL",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Urban Micro-Loft",
      ownership: "42%",
      currentValue: "0.9 ETH",
      purchaseValue: "0.75 ETH",
      return: "+20%",
      location: "Chicago, IL",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
    }
  ]
};

// Mock chart data
const monthlyReturnsData = [
  { month: "Jan", return: 0.02 },
  { month: "Feb", return: 0.015 },
  { month: "Mar", return: 0.025 },
  { month: "Apr", return: 0.01 },
  { month: "May", return: 0.03 },
  { month: "Jun", return: 0.035 }
];

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  // Calculate max return for chart scaling
  const maxReturn = Math.max(...monthlyReturnsData.map(d => d.return));

  return (
    <div className="dashboard-page">
      {/* Navigation */}
      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-icon"></span>
            CryptoEstates
          </Link>
          
          <div className="nav-links">
            <Link href="/dashboard" className="nav-link active">Dashboard</Link>
            <Link href="/invest" className="nav-link">Invest</Link>
            <Link href="/portfolio" className="nav-link">Portfolio</Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-welcome">
          <h1 className="dashboard-title">
            Welcome, {user.firstName || 'Investor'}
          </h1>
          <p className="dashboard-subtitle">
            Here's an overview of your real estate investment portfolio
          </p>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">
              Total Invested
            </p>
            <p className="stat-value">
              {userInvestments.totalInvested}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              Portfolio Value
            </p>
            <p className="stat-value">
              {userInvestments.portfolioValue}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              Total Return
            </p>
            <p className="stat-value positive">
              {userInvestments.returns}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              Properties Owned
            </p>
            <p className="stat-value">
              {userInvestments.properties}
            </p>
          </div>
        </div>

        {/* Portfolio Performance and Activity */}
        <div className="dashboard-grid">
          {/* Portfolio Performance Chart */}
          <div className="dashboard-card">
            <h2 className="card-title">
              Monthly Returns
            </h2>
            
            <div className="chart-container">
              <div className="chart-bars">
                {monthlyReturnsData.map((data, index) => (
                  <div key={index} className="chart-column">
                    <div className="chart-bar" style={{ height: `${(data.return / maxReturn) * 150}px` }}></div>
                    <div className="chart-label">
                      {data.month}
                    </div>
                  </div>
                ))}
                
                {/* Y-axis lines */}
                <div className="chart-grid">
                  {[0, 1, 2, 3].map((_, index) => (
                    <div key={index} className="chart-grid-line" style={{ bottom: `${index * 50}px` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h2 className="card-title">
              Recent Activity
            </h2>
            
            <div className="activity-list">
              {userInvestments.recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.type === 'investment' ? 'investment' : 'dividend'}`}>
                    {activity.type === 'investment' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="activity-content">
                    <p className="activity-title">
                      {activity.type === 'investment' ? 'Invested in' : 'Received dividend from'} {activity.property}
                    </p>
                    <p className="activity-date">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="activity-amount">
                    <p className={`amount ${activity.type === 'investment' ? 'investment' : 'dividend'}`}>
                      {activity.type === 'investment' ? '-' : '+'}{activity.amount}
                    </p>
                    <p className="activity-status">
                      {activity.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Your Properties */}
        <div className="properties-section">
          <h2 className="section-title">
            Your Properties
          </h2>
          
          <div className="properties-grid">
            {userInvestments.ownedProperties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-image-container">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="property-image"
                  />
                  <div className="property-badge">
                    {property.ownership} Ownership
                  </div>
                </div>
                
                <div className="property-content">
                  <h3 className="property-title">
                    {property.title}
                  </h3>
                  <p className="property-location">
                    {property.location}
                  </p>
                  
                  <div className="property-stats">
                    <div className="property-stat">
                      <p className="stat-label">Purchase Value</p>
                      <p className="stat-value">{property.purchaseValue}</p>
                    </div>
                    <div className="property-stat">
                      <p className="stat-label">Current Value</p>
                      <p className="stat-value">{property.currentValue}</p>
                    </div>
                    <div className="property-stat">
                      <p className="stat-label">Return</p>
                      <p className="stat-value positive">{property.return}</p>
                    </div>
                  </div>
                  
                  <div className="property-actions">
                    <button className="btn btn-primary">
                      View Details
                    </button>
                    <button className="btn btn-outline">
                      Sell Tokens
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explore More Properties */}
        <div className="cta-section">
          <h2 className="cta-title">
            Looking to expand your portfolio?
          </h2>
          <p className="cta-description">
            Explore our curated selection of premium real estate opportunities with high growth potential.
          </p>
          <Link href="/invest" className="btn btn-primary btn-large">
            Explore Investment Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
} 