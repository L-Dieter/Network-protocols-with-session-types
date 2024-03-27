import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
console.log('Connected to WebSocket server');

// Set up readline interface for command input
const readline = require('readline').createInterface({
input: process.stdin,
output: process.stdout
});

readline.question('Enter a message: ', (message: string) => {
ws.send(message);
console.log(`Sent message: ${message}`);
readline.close();
});

ws.on('message', (data: WebSocket.Data) => {
console.log(`Received message: ${data.toString()}`);
});

ws.on('close', () => {
console.log('Disconnected from WebSocket server');
});
});