import WebSocket from 'ws';
import { config } from 'dotenv';
import {getTokenVolume} from './src/getTokenVolume.js'; 
import {launchToken} from './src/launch.js'

config();

const WS_ENDPOINT = process.env.WS_ENDPOINT;
const COMPARE_AMOUNT = parseInt(process.env.COMPARE_AMOUNT);
const DELAY_TIME = parseFloat(process.env.DELAY_TIME);
const COMPARE_VOLUME_AMOUNT = parseInt(process.env.COMPARE_VOLUME_AMOUNT);

let ws = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

async function connectWebSocket() {
  try {
    ws = new WebSocket(WS_ENDPOINT);
    ws.on('open', () => {
      console.log('Connection opened.');
      subscribeToNewTokens();
      reconnectAttempts = 0;
    });

    ws.on('message', async (message) => {
      await handleMessage(message);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed. Reconnecting...');
      handleWebSocketError();
    });

    ws.on('error', (err) => {
      console.log('WebSocket error:', err);
      handleWebSocketError();
    });
  } catch (err) {
    console.error('Error establishing WebSocket connection:', err);
    handleWebSocketError();
  }
}

function subscribeToNewTokens() {
  const payload = { method: 'subscribeNewToken' };
  ws.send(JSON.stringify(payload));
}

async function handleMessage(message) {
  const newTokenInfo = JSON.parse(message);
  if (newTokenInfo.message === 'Successfully subscribed to token creation events.') {
    console.log("Subscription message received");
  } else if (parseFloat(newTokenInfo.solAmount) >= COMPARE_AMOUNT) {
    console.log('Received new token!');
    checkVolumeAfterDelay(DELAY_TIME, newTokenInfo);
  }
}
let tokens = [];
async function checkVolumeAfterDelay(delay, tokenInfo) {
  setTimeout(async () => {
    const totalVolume = await getTokenVolume(tokenInfo.mint);
    console.log(`Volume after ${DELAY_TIME} seconds for ${tokenInfo.mint}: ${totalVolume}`);

    if (parseInt(totalVolume) > COMPARE_VOLUME_AMOUNT) {
        try {
            const response = await fetch(tokenInfo.uri);
            
            const data = await response.json();

            if (data && tokens.length == 0) {
                tokens.push(data)
                createToken(data, tokenInfo.mint);
            }
        } catch (error) {
            console.error('Error fetching data:', error);  
        }
}

  }, delay * 1000);
}

async function createToken(tokenInfo, mint) {
    console.log(`Creating token for mint: ${mint}`);
    await launchToken(tokenInfo);
    console.log(`Created token for mint: ${mint}`);

}

async function handleWebSocketError() {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    setTimeout(() => connectWebSocket(), 1000 * reconnectAttempts);
  } else {
    console.log('Max reconnection attempts reached. Giving up.');
  }
}

async function main() {
  await connectWebSocket();
}

main();
