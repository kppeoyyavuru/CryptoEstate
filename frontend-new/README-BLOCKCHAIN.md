# Blockchain Integration

This document explains how to set up and interact with the Ethereum smart contracts for property tokenization in the CryptoEstates application.

## Smart Contracts

CryptoEstates uses two main smart contracts:

1. **PropertyFactory**: Creates and manages property tokens, handles investments
2. **PropertyToken**: ERC20-like token representing shares in a property

## Setting Up the Blockchain Environment

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start a local Hardhat blockchain node:
   ```
   npm run start-node
   ```

3. Deploy contracts to the local network:
   ```
   npm run deploy-contracts:localhost
   ```

4. For a one-command setup:
   ```
   npm run deploy-and-setup
   ```

### Testnet Deployment (Sepolia)

1. Create a `.env` file with your private key and Infura/Alchemy API key:
   ```
   PRIVATE_KEY=your_private_key_here
   INFURA_API_KEY=your_infura_api_key_here
   ```

2. Deploy to Sepolia testnet:
   ```
   npm run deploy-contracts:sepolia
   ```

## Contract Addresses

After deployment, contract addresses are saved to `contracts/deployment.json` and can be updated in the BlockchainService.ts file.

## Interacting with the Contracts

The application uses the `BlockchainService.ts` service to interact with the smart contracts:

- `investInProperty`: Invests ETH in a property and receives tokens
- `getPropertyDetails`: Gets property details from the blockchain
- `getInvestorDetails`: Gets investor details for a specific property

## Testing with MetaMask

1. Connect MetaMask to the local network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. Import a test account using a private key from the Hardhat node output

3. Test investing in properties using the UI

## Transaction Flow

When a user invests in a property:

1. User connects their MetaMask wallet
2. User selects a property and amount to invest
3. MetaMask prompts for transaction approval
4. Smart contract processes the investment and mints property tokens
5. Transaction hash is saved in the database
6. User's dashboard updates with their new investment

## Troubleshooting

- **MetaMask connection issues**: Ensure you're connected to the correct network
- **Transaction failures**: Check your ETH balance and gas settings
- **Contract interaction errors**: Verify contract addresses in the BlockchainService

## Contract Verification

For testnet deployments, verify your contracts on Etherscan:

```
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS constructor_arg1 constructor_arg2
``` 