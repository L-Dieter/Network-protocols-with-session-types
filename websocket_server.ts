// Start a WebSocket server

import { WebSocketServer } from "ws";

const port = 3000;
const wss = new WebSocketServer({port});

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message: string) => {
        console.log(`Received message from client: ${message}`);

        // if (message.toString() !== 'Connected to WebSocket server') {
        //     ws.send(`You sent: ${message}`);
        // }
        let msg: string[] = message.toString().split(" ");
        switch(msg[0]) {
            case 'Connected': {
                break;
            }
            case 'add': {
                const arg1 = +msg[1];
                const arg2 = +msg[2];
                const result = arg1 + arg2;
                ws.send(result);
                break;
            }
            case 'neg': {
                break;
            }
            case 'end': {
                break;
            }
            default: {
                ws.send(`You sent: ${message}`);
                break;
            }
            
        }
        
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    
    ws.send(`Hello, this is the Server!`);
    ws.send(`input`);

});

console.log(`Listening at ${port}...`);
