import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;

async function getSignaturesForToken(tokenMint, rpcUrl = RPC_ENDPOINT) {
    const connection = new Connection(rpcUrl, 'confirmed');
    let signatures = [];
    let beforeTx = null;

    try {
        const response = await connection.getSignaturesForAddress(
            new PublicKey(tokenMint), { before: beforeTx, limit: 1000 }
        );

        signatures = response.map(tx => tx.signature);

        return signatures;

    } catch (error) {
        console.error(`Error fetching signatures: ${error}`);
        return [];
    }
}

export async function getAllSignatures(tokenMint) {
    const signatures = await getSignaturesForToken(tokenMint);
    return signatures;
}


(async () => {
    const tokenMintAddress = 'YOUR_TOKEN_MINT_ADDRESS'; 
    const signatures = await getAllSignatures(tokenMintAddress);
    console.log(`Signatures for Token Mint (${tokenMintAddress}):`, signatures);
})();
