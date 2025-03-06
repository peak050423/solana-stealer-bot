import { VersionedTransaction, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const web3Connection = new Connection(RPC_ENDPOINT, "confirmed");
const signerKeyPair = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));

export async function autoSell(tokenMintAddress) {
  const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicKey: signerKeyPair.publicKey.toBase58(), 
      action: "sell", 
      mint: tokenMintAddress, 
      denominatedInSol: "true", 
      amount: "100%",
      slippage: 50,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });
  if (response.status === 200) {
    const data = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(data));
    const signerKeyPair = Keypair.fromSecretKey(
      bs58.decode(WALLET_PRIVATE_KEY)
    );
    tx.sign([signerKeyPair]);
    const signature = await web3Connection.sendTransaction(tx);
    console.log("Auto-sell Transaction: https://solscan.io/tx/" + signature);
  } else {
    console.log(response.statusText); // log error
  }
}

