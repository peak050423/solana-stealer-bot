import { VersionedTransaction, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
import { autoSell } from "./autoSell.js";

dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const DEV_BUY = parseFloat(process.env.DEV_BUY);
const INITIAL_BUY = parseFloat(process.env.INITIAL_BUY);
const AUTO_SELL = parseFloat(process.env.AUTO_SELL);

const web3Connection = new Connection(RPC_ENDPOINT, "confirmed");

export async function launchToken(tokenInfo) {
  const signerKeyPair = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));

  // Generate a random keypair for token
  const mintKeypair = Keypair.generate();
  const formData = new FormData();
  // Define token metadata
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

  // Create IPFS metadata storage
  const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: formData,
  });

  const metadataResponseJSON = await metadataResponse.json();

  // Get the create transaction
  const bundledTxArgs = [
    {
      publicKey: signerKeyPair.publicKey.toBase58(),
      action: "create",
      tokenMetadata: {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        uri: metadataResponseJSON.metadataUri,
      },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: "true",
      amount: DEV_BUY,
      slippage: 10,
      priorityFee: 0.00001, // priority fee on the first tx is used for jito tip
      pool: "pump",
    },
    {
      publicKey: signerKeyPair.publicKey.toBase58(),
      action: "buy",
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: "false",
      amount: INITIAL_BUY,
      slippage: 10,
      priorityFee: 0.00001, // priority fee after first tx is ignored
      pool: "pump",
    },
    // use up to 5 transactions
  ];
  const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bundledTxArgs),
  });

  console.log("____response____", response);
  
  if (response.status === 200) {
    // successfully generated transactions
    const transactions = await response.json();

    // console.log("_________transactions_______", transactions);
    
    let encodedSignedTransactions = [];
    let signatures = [];
    for (let i = 0; i < bundledTxArgs.length; i++) {
      const tx = VersionedTransaction.deserialize(
        new Uint8Array(bs58.decode(transactions[i]))
      );
      if (bundledTxArgs[i].action === "create") {
        tx.sign([mintKeypair, signerKeyPair]);
      } else {
        tx.sign([signerKeyPair]);
      }
      encodedSignedTransactions.push(bs58.encode(tx.serialize()));
      signatures.push(bs58.encode(tx.signatures[0]));
    }

    console.log("____signatures____", signatures);
    

    try {
      const jitoResponse = await fetch(
        `https://mainnet.block-engine.jito.wtf/api/v1/bundles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "sendBundle",
            params: [encodedSignedTransactions],
          }),
        }
      );
      console.log(jitoResponse);
    } catch (e) {
      console.error(e.message);
    }
    for (let i = 0; i < signatures.length; i++) {
      console.log(`Transaction ${i}: https://solscan.io/tx/${signatures[i]}`);
    }

    console.log("____mintAddress____", mintKeypair.publicKey.toBase58());
    setTimeout(() => autoSell(mintKeypair.publicKey.toBase58()), AUTO_SELL * 1000);

  } else {
    console.log(response.statusText); // log error
  }
}
