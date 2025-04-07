import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-shape"></div>
        <div className="auth-shape"></div>
        <div className="auth-shape"></div>
      </div>
      
      <header className="auth-header">
        <Link href="/" className="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="auth-logo-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>CryptoEstates</span>
        </Link>
      </header>
      
      <main className="auth-content">
        <div className="auth-card">
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Start investing in blockchain real estate today</p>
          
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'auth-button',
                card: 'auth-clerk-card',
                headerTitle: 'auth-clerk-title',
                headerSubtitle: 'auth-clerk-subtitle',
                socialButtonsBlockButton: 'auth-social-button',
                formFieldInput: 'auth-input',
                formFieldLabel: 'auth-label',
                footer: 'auth-clerk-footer'
              }
            }}
            redirectUrl="/invest"
          />
          
          <div className="auth-footer-text">
            <p>Already have an account? <Link href="/sign-in" className="auth-link">Sign in</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
} 