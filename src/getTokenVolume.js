import {Connection } from '@solana/web3.js';
import { getAllSignatures } from './getAllSignatures.js';
import dotenv from 'dotenv';


dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

async function getTransactionAmount(signature) {
    try {
        const result = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });

        if (result) {
            try {
                const preAmountStrings = result.meta.preTokenBalances[0].uiTokenAmount.uiAmount;
                return preAmountStrings
            } catch {
                return 0
            }
        }
    } catch (error) {
        console.error(`Error fetching transaction for signature ${signature}:`, error);
    }

    return 0;  
}

export async function getTokenVolume(tokenMintAddress) {
    const signaturesData = await getAllSignatures(tokenMintAddress);  
    let totalVolume = 0;

    for (const txSignature of signaturesData) {
        const transactionAmount = await getTransactionAmount(txSignature);
        totalVolume += parseFloat(transactionAmount);  
    }

    return totalVolume.toString();
}