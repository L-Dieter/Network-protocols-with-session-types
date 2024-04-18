// Starts a WebSocket client and connects to a server

import WebSocket from "ws";

const port = 3000;
const ws = new WebSocket(`ws://localhost:${port}`);

ws.on('open', () => {
    console.log('[Client] Connected.');
    ws.send('Connected to WebSocket server');

});

ws.on('message', (data: WebSocket.Data) => {
    if (data.toString() === "input") {

        // Set up a readline interface for command input
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })
        
        readline.question('Enter a message: ', (message: string) => {
            ws.send(message);
            readline.close();
        })
        
    } else { 
        console.log(`Received a message from the server:\n ${data}`);
    }
});

ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});
