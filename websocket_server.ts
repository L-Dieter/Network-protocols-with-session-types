// Start a WebSocket server

import { WebSocketServer } from "ws";

const port = 3000;
const wss = new WebSocketServer({port});

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);

        if (message.toString() !== 'Connected to WebSocket server') {
            ws.send(`You sent: ${message}`);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.send(`Hello, this is the Server!`);
});

console.log(`Listening at ${port}...`);
