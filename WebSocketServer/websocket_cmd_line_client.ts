// Starts a WebSocket client and connects to a server

import WebSocket from "ws";

const port = 3000;
const ws = new WebSocket(`ws://localhost:${port}`);

// Set up a readline interface for command input
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

ws.on('open', () => {
    console.log('[Client] Connected.');
    ws.send('Connected to WebSocket server');
    
});

ws.on('message', (data: WebSocket.Data) => {
    if (data.toString() === "input") {
        
        readline.question('Enter a message: ', (message: string) => {
            const splitMsg: string[] = message.split(" ");
            for (let msg of splitMsg) {
                ws.send(msg);
            }
            // readline.close();
        })
        
    } 
    else if (data.toString() === "anotherInput") {

        readline.question('Another message?: ', (message: string) => {
            const splitMsg: string[] = message.split(" ");
            for (let msg of splitMsg) {
                ws.send(msg);
            }
            // readline.close();
        })
        
    }
    else if (data.toString() === "closeConnection") {
        readline.close();
        ws.close();
    }
    else { 
        console.log(`Received a message from the server:\n ${data}`);
    }
});

ws.on('close', () => {
    readline.close();
    console.log('Disconnected from WebSocket server');
});
