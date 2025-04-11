import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import PropertyList from './components/PropertyList'
import { Suspense } from 'react'

// Make this a client component that loads quickly
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
                <Link href="/sign-in" className="text-gray-600 hover:text-orange-600">
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

          <PropertyList initialProperties={[]} />
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

      {/* CTA Section - Only shown when user is not signed in */}
      <SignedOut>
        <div className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8 opacity-90">
              Join thousands of investors already building their real estate portfolio with CryptoEstates.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/sign-up" className="btn btn-lg bg-white text-orange-600 hover:bg-gray-100">
                Create Account
              </Link>
              <Link href="/invest" className="btn btn-lg border-2 border-white text-white hover:bg-orange-600">
                Explore Investments
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  )
} 