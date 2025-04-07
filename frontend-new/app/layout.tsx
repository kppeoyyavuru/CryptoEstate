import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Footer from './components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CryptoEstates - Web3 Real Estate Platform',
  description: 'Buy, sell, and invest in real estate using cryptocurrency',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning style={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <Providers>
          <div style={{ flex: '1' }}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
} 