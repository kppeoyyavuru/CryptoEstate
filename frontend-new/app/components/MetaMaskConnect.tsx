'use client';

import { useState, useEffect } from 'react';

interface MetaMaskConnectProps {
  onWalletChange?: (connected: boolean, address: string) => void;
  onConnect?: (address: string) => void;
  onAccountsChanged?: (address: string | null) => void;
}

export function MetaMaskConnect({ onWalletChange, onConnect, onAccountsChanged }: MetaMaskConnectProps) {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Check if MetaMask is installed
  useEffect(() => {
    const checkIfMetaMaskIsInstalled = () => {
      const { ethereum } = window as any;
      if (!ethereum || !ethereum.isMetaMask) {
        setIsMetaMaskInstalled(false);
        setError('MetaMask is not installed. Please install it to continue.');
      }
    };
    
    checkIfMetaMaskIsInstalled();
  }, []);
  
  // Check if already connected
  useEffect(() => {
    const checkIfConnected = async () => {
      try {
        const { ethereum } = window as any;
        if (ethereum && ethereum.isMetaMask) {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            if (onWalletChange) onWalletChange(true, accounts[0]);
            if (onConnect) onConnect(accounts[0]);
            if (onAccountsChanged) onAccountsChanged(accounts[0]);
          }
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };
    
    checkIfConnected();
  }, [onWalletChange, onConnect, onAccountsChanged]);
  
  // Connect to MetaMask
  const connectWallet = async () => {
    setError('');
    setIsConnecting(true);
    
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        setError('MetaMask is not installed. Please install it to continue.');
        return;
      }
      
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        if (onWalletChange) onWalletChange(true, accounts[0]);
        if (onConnect) onConnect(accounts[0]);
        if (onAccountsChanged) onAccountsChanged(accounts[0]);
      }
      
      // Listen for account changes
      ethereum.on('accountsChanged', (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          setAccount('');
          setIsConnected(false);
          if (onWalletChange) onWalletChange(false, '');
          if (onConnect) onConnect('');
          if (onAccountsChanged) onAccountsChanged(null);
        } else {
          setAccount(newAccounts[0]);
          setIsConnected(true);
          if (onWalletChange) onWalletChange(true, newAccounts[0]);
          if (onConnect) onConnect(newAccounts[0]);
          if (onAccountsChanged) onAccountsChanged(newAccounts[0]);
        }
      });
    } catch (err: any) {
      console.error('Error connecting to MetaMask:', err);
      setError(err.message || 'Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-yellow-100 p-4 rounded-lg mb-4">
        <p className="text-yellow-800">
          MetaMask is not installed. Please{' '}
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            install MetaMask
          </a>{' '}
          to continue.
        </p>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      {error && (
        <div className="bg-red-100 p-3 rounded-lg mb-3 text-red-800">
          {error}
        </div>
      )}
      
      {isConnected ? (
        <div className="border border-gray-200 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-orange-500 rounded-full mr-2"></div>
              <p className="text-gray-700">Connected: <span className="font-medium">{formatAddress(account)}</span></p>
            </div>
            <button
              onClick={() => {
                setAccount('');
                setIsConnected(false);
                if (onWalletChange) onWalletChange(false, '');
                if (onConnect) onConnect('');
                if (onAccountsChanged) onAccountsChanged(null);
              }}
              className="text-sm text-orange-600 hover:text-orange-800"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
                <path d="M378.7 32H133.3C82.4 32 41 73.4 41 124.3V387.7C41 438.6 82.4 480 133.3 480H378.7C429.6 480 471 438.6 471 387.7V124.3C471 73.4 429.6 32 378.7 32zm0 48c24.2 0 44.3 17.1 44.3 41.3V' 239H389V121.3C389 97.1, 402.9 80 426.1 80zM97 72h320v24H97V72zm290.4 361.2c-11.5 22.5-33.5 36.8-58.5 36.8-35.5 0-65.3-28.4-65.3-64 0-35.5 29.8-64 65.3-64 25 0 47 15.4 57.4 32h-32c-5.5-6.9-13.7-16-25.4-16-17.8 0-32.3 14.4-32.3 32s14.5 32 32.3 32c12.7 0 21-7.9 24.5-16h34v32h.5z"/>
              </svg>
              Connect MetaMask
            </>
          )}
        </button>
      )}
    </div>
  );
}

// For backwards compatibility
export default MetaMaskConnect; 