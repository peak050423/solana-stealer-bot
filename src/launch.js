import { VersionedTransaction, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
import { autoSell } from "./autoSell.js";

dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const DEV_BUY = parseFloat(process.env.DEV_BUY);
const AUTO_SELL = parseFloat(process.env.AUTO_SELL);
const web3Connection = new Connection(RPC_ENDPOINT, "confirmed");


export async function launchToken(tokenInfo) {
    const signerKeyPair = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));

    const mintKeypair = Keypair.generate(); 

    const formData = new FormData();
    const imageUrl = tokenInfo.image;
    const getImage = await fetch(imageUrl);
    const imageBlob = await getImage.blob();

    formData.append("file", imageBlob, "image.png");

    for (let key in tokenInfo) {
      if (tokenInfo.hasOwnProperty(key)) {
        if (key != "image" && key != "createdOn")
          formData.append(key, tokenInfo[key]);
      }
    }

    const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: formData,
    });
    const metadataResponseJSON = await metadataResponse.json();

    const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "publicKey": signerKeyPair.publicKey.toBase58(), 
            "action": "create",
            "tokenMetadata": {
                name: metadataResponseJSON.metadata.name,
                symbol: metadataResponseJSON.metadata.symbol,
                uri: metadataResponseJSON.metadataUri
            },
            "mint": mintKeypair.publicKey.toBase58(),
            "denominatedInSol": "true",
            "amount": DEV_BUY, 
            "slippage": 10, 
            "priorityFee": 0.0005,
            "pool": "pump"
        })
    });
    if(response.status === 200){ 
      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      tx.sign([mintKeypair, signerKeyPair]);
      const signature = await web3Connection.sendTransaction(tx)
      console.log("Token created with DEV_BUY. Creation Transaction: https://solscan.io/tx/" + signature);
      setTimeout(() => autoSell(mintKeypair.publicKey.toBase58()), AUTO_SELL * 1000);
    } else {
        console.log(response.statusText); 
    }
}

sendLocalCreateTx();