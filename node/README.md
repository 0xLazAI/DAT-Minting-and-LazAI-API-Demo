# DAT Mint - LazAI Data Privacy Application

A TypeScript application that encrypts data, uploads it to IPFS, registers it with LazAI blockchain, and requests proofs and rewards.

## Quick Start

```bash
npm install
npm run build
npm start
```

## File Structure

```
dat_mint/
├── src/
│   └── main.ts          # Main application code
├── dist/
│   └── main.js          # Compiled JavaScript
├── .env                 # Environment variables (required)
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## Environment Setup

### Required .env File

Create a `.env` file in the root directory with the following variables:

```env
PRIVATE_KEY=your_ethereum_private_key_here
IPFS_JWT=your_pinata_jwt_token_here
```

### Getting Your Keys

1. **PRIVATE_KEY**: Your Ethereum private key (without 0x prefix)
   - Generate a new wallet or use an existing one
   - Export the private key (64 character hex string)

2. **IPFS_JWT**: Pinata Cloud JWT token
   - Sign up at [pinata.cloud](https://pinata.cloud)
   - Create an API key with upload permissions
   - Copy the JWT token

## Dependencies

The application uses these main dependencies:

- `alith` - LazAI blockchain client
- `dotenv` - Environment variable management
- `node-fetch` - HTTP requests
- `form-data` - File upload handling
- `node-rsa` - RSA encryption
- `crypto` - Data hashing

## Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Run the application
node dist/main.js
```

### Production Mode

```bash
# Build and run
npm run build && npm start
```

## Application Flow

1. **Data Encryption**: Encrypts privacy data using AES encryption
2. **IPFS Upload**: Uploads encrypted data to Pinata IPFS
3. **File Registration**: Registers file with LazAI blockchain
4. **Proof Request**: Requests proof from LazAI node
5. **Reward Claim**: Claims reward for data contribution

## Expected Output

When successful, the application will output:

```
File ID: 2530
Transaction Hash: 0x1234567890abcdef...
🔗 https://testnet-explorer.lazai.network/tx/0x1234567890abcdef...
```

### Output Explanation

- **File ID**: Unique identifier for your file in the LazAI system
- **Transaction Hash**: Blockchain transaction hash for the reward claim
- **Explorer Link**: Direct link to view the transaction on LazAI testnet explorer

## Configuration

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### Package Configuration (package.json)

The application requires `"type": "module"` for ES module support.

## Error Handling

The application includes error handling for:

- Missing environment variables
- IPFS upload failures
- Blockchain transaction errors
- RSA encryption issues (with fallback)

## Network Information

- **Blockchain**: LazAI Testnet
- **Chain ID**: 133718
- **Explorer**: https://testnet-explorer.lazai.network
- **IPFS Provider**: Pinata Cloud

## Troubleshooting

### Common Issues

1. **Missing .env file**: Ensure `.env` exists with required variables
2. **Invalid private key**: Check private key format (64 hex characters)
3. **IPFS upload fails**: Verify Pinata JWT token permissions
4. **Network errors**: Check internet connection and service availability

### Debug Mode

Add logging by modifying the source code if needed, or check the terminal output for error details.

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- The `.gitignore` file is configured to exclude `.env` and other sensitive files
- Use a dedicated wallet for testing (not your main wallet)
- The application uses LazAI testnet (no real value at risk)

## Git Setup (Optional)

If you want to version control your project:

```bash
# Initialize git repository
git init

# Add files (gitignore will protect sensitive files)
git add .

# Initial commit
git commit -m "Initial commit: LazAI data privacy application"
```

The `.gitignore` file ensures your `.env` file and other sensitive data won't be accidentally committed.

## License

This project is for demonstration purposes. Check LazAI and Pinata terms of service for production use.