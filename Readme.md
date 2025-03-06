# Auto-Launcher & Metadata Stealer Bot

## Overview

The Auto-Launcher & Metadata Stealer Bot is an automated trading bot designed for the Solana blockchain. This bot utilizes on-chain data to identify newly launched tokens with significant trading volume and then replicates and sells these tokens to capture quick profits. The bot continuously monitors the blockchain for tokens that achieve a trading volume of 1,000 to 2,000 Solana (SOL) within the first few minutes after launch. The core functionality of the bot is to "steal" the metadata (configuration parameters and token details) from high-performing tokens and re-launch them to quickly capitalize on market trends.

## Key Features of Auto-Launcher & Metadata Stealer Bot:

1. On-Chain Data Integration:
   The bot monitors Solana blockchain data for newly launched tokens with high trading volume.
   It uses Solscan to track tokens and identifies those with 1,000-2,000 SOL volume in the first few minutes.

2. Automatic Execution:
   The bot automatically extracts metadata (token details) from high-performing tokens.
   It then launches a replica of the token on platforms like pump.fun.

3. Auto-sell function: The bot sells the dev token shortly after launch to secure profits.

4. Real-Time Monitoring:
   Continuously monitors tokens to identify those with strong trading volume early after launch.

5. Metadata Extraction:
   The bot extracts important details like token name, symbol, and URI from successful tokens and uses it to create new tokens.
   Parameter Customization:

## Key Environment Variables in Your `.env` File:

```bash
   RPC_ENDPOINT=REPLACE_YOUR_RPC_URL_HERE                      # Solana RPC endpoint - replace with your actual RPC URL
   WS_ENDPOINT=REPLACE_YOUR_WS_URL_HERE                        # WebSocket endpoint for real-time monitoring - replace with your actual WebSocket URL
   WALLET_PUBLIC_KEY=REPLACE_YOUR_WALLET_PUBLIC_KEY_HERE       # Your Solana wallet public key - replace with your actual public key
   WALLET_PRIVATE_KEY=REPLACE_YOUR_WALLET_PRIVATE_KEY_HERE     # Your Solana wallet private key - replace with your actual private key
   RETRY_ATTEMPTS=2                                            # Number of retry attempts for failed operations
   RETRY_DELAY=5000                                            # Delay between retry attempts in milliseconds
   COMPARE_AMOUNT=3                                            # Compare tokens with an amount greater than 3 SOL
   DELAY_TIME=30                                               # Time delay between token launch and get volume (in seconds)
   COMPARE_VOLUME_AMOUNT=200000000                             # Minimum volume amount for comparison to decide whether to engage with a token
   DEV_BUY=0.6                                                 # Subsequent token purchases will be made with 0.6 SOL each
   AUTO_SELL=12                                                # The token will automatically be sold 12 seconds after the purchase
```

## Install Project Dependencies

Once the `.env` file is set up, you need to install the required dependencies. Run the following command:

```bash
npm install
```

This will install all the necessary packages that the project depends on.

## Run the Project

Once everything is set up, you can run the bot. The entry point of the project is likely main.js or another script that you want to run. To start the bot, run:

```bash
node main.js
```

## Monitor Logs & Output

As the bot runs, it will output logs and information about its actions (such as token launches, transactions, or errors). You should monitor the terminal for any errors or updates.
If there are any issues with the private key, wallet access, or interactions with Solana, the bot may print error messages. Make sure to handle these errors and verify your configuration.

## Troubleshooting

- If the bot isn't working as expected, check the transaction logs for any failed operations or error messages.
- Double-check the RPC endpoint and WebSocket endpoint to make sure they are accessible and correct.
- Ensure that the private key in .env is correctly formatted and that the wallet has sufficient SOL for transactions.

Let me know if you need any further assistance with running the project!
