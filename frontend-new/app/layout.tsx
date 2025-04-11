import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import { BlockchainProvider } from "./blockchain/BlockchainContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoEstates | Blockchain-Powered Real Estate Investments",
  description: "Invest in tokenized real estate properties using cryptocurrency with CryptoEstates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Log the environment variable to verify it's loaded
  console.log('Clerk Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <BlockchainProvider>
            <div style={{ flex: '1' }}>
              {children}
            </div>
            <Footer />
          </BlockchainProvider>
        </ClerkProvider>
      </body>
    </html>
  );
} 