# CryptoEstates - Blockchain-Powered Real Estate Investments

CryptoEstates is a platform that enables users to invest in tokenized real estate properties using cryptocurrency.

## Project Structure

- `app/` - Next.js frontend application
- `contracts/` - Solidity smart contracts
- `scripts/` - Deployment scripts
- `prisma/` - Database schema and client

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask wallet with some Sepolia ETH for testing
- Alchemy or Infura account for Sepolia RPC URL
- Etherscan API key for contract verification

### Setup Environment Variables

Copy the `.env.example` file to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: Your Neon PostgreSQL database URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication publishable key
- `CLERK_SECRET_KEY`: Clerk authentication secret key
- `PRIVATE_KEY`: Your Ethereum wallet private key for contract deployment
- `SEPOLIA_RPC_URL`: Sepolia testnet RPC URL (from Alchemy/Infura)
- `ETHERSCAN_API_KEY`: API key for Etherscan contract verification

### Install Dependencies

```bash
npm install
```

### Deploy Smart Contracts to Sepolia

Run the following command to deploy the contracts to Sepolia testnet:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

This will:
1. Deploy the PropertyFactory contract
2. Create sample property tokens
3. Update the contracts.json file with the deployed addresses
4. Verify the contract on Etherscan

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Smart Contracts

The project includes the following smart contracts:

1. **PropertyFactory.sol** - Main contract for creating and managing tokenized real estate properties
2. **PropertyToken.sol** - ERC20 token contract for property shares

## Using MetaMask with the Application

1. Install the MetaMask browser extension
2. Create or import a wallet
3. Switch to the Sepolia test network
4. Get some test ETH from a Sepolia faucet
5. Connect your wallet to the application
6. Browse and invest in properties

## Features

- User authentication with Clerk
- MetaMask wallet integration
- Tokenized real estate investment
- Dashboard to track investments
- Property listings with detailed information
