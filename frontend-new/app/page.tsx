import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'

// Mock data for featured properties
const featuredProperties = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    price: "0.5 ETH",
    location: "New York, NY",
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Luxury Villa with Pool",
    price: "2.3 ETH",
    location: "Miami, FL",
    beds: 4,
    baths: 3,
    sqft: 3200,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Beachfront Condo",
    price: "1.2 ETH",
    location: "Los Angeles, CA",
    beds: 3,
    baths: 2,
    sqft: 1800,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="navbar">
        <div className="navbar-container">
          <Link href="/" className="navbar-brand">
            <span className="navbar-logo"></span>
            CryptoEstates
          </Link>
          <div className="navbar-links">
            <Link href="/properties">Properties</Link>
            <Link href="/invest">Invest</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <div className="flex items-center gap-4">
                <Link href="/sign-in" className="text-gray-600 hover:text-blue-600">
                  Sign In
                </Link>
                <Link href="/sign-up" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="btn btn-outline">
                  Dashboard
                </Link>
                <Link href="/invest" className="btn btn-primary">
                  Invest Now
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-bg">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"
            alt="Luxury Real Estate"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/80"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Blockchain-powered <br />Real Estate
          </h1>
          <p className="hero-subtitle">
            Buy, sell, and invest in premium real estate properties using cryptocurrency and blockchain technology.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/properties" className="btn btn-primary btn-lg">
              Browse Properties
            </Link>
            <Link href="/about" className="btn btn-outline-white btn-lg">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our curated selection of premium real estate investments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="relative h-[220px] w-full overflow-hidden">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="property-content">
                  <h3 className="property-title">{property.title}</h3>
                  <p className="property-price">{property.price}</p>
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
                  <div className="property-features">
                    <div className="property-feature">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {property.beds} Beds
                    </div>
                    <div className="property-feature">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {property.baths} Baths
                    </div>
                    <div className="property-feature">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                      {property.sqft} sqft
                    </div>
                  </div>
                  
                  <button className="btn btn-primary w-full mt-4">View Details</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/properties" className="btn btn-primary">
              View All Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CryptoEstates
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The future of real estate investment is here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="feature-title">Blockchain Security</h3>
              <p className="feature-text">
                All property transactions are secured by blockchain technology, providing transparency and immutability.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Crypto Payments</h3>
              <p className="feature-text">
                Buy and sell properties using various cryptocurrencies with lower fees and faster transactions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Fractional Ownership</h3>
              <p className="feature-text">
                Invest in portions of high-value properties, making real estate investment accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
            Join thousands of investors already building their real estate portfolio with CryptoEstates.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/sign-up" className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100">
              Create Account
            </Link>
            <Link href="/invest" className="btn btn-lg btn-outline-white">
              Explore Investments
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 