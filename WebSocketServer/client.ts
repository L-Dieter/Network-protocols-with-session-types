// Starts a WebSocket client and connects to a server

import WebSocket from "ws";
import { Type } from './protocol';

// Set up a readline interface to be able to answer a request from the server
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

// check if the message still needs to be stringified
const checkInput = (message: any): boolean => {
    try {
        JSON.parse(message);
    } catch (error) {
        return false;
    }
    return true;
}


// create a new client
function mk_client (cmd_line: any) {
    
    // open a connection with a server
    const ws = new WebSocket(`${cmd_line[2]}`);

    // each incoming message has to be of that type
    let msg: { name: string, type: Type, content?: any};

    // get a notification when the client connects to the server
    ws.on('open', () => {
        console.log(`[Connected to server with url: ${cmd_line[2]}]`);
    });
    
    // get messages from the server
    ws.on('message', (data: any) => {

        msg = JSON.parse(data);

        // check if the message is a request from the server
        if (msg.name === "request") {
            ws.emit('send');
        }
        else {
            console.log(`Received a message from the server:\n ${msg.name}: ${msg.content}`);
        }

    });
    
    // close the connection
    ws.on('close', () => {
        console.log('Disconnected from WebSocket server');
        readline.close();
    });

    // open a readline if needed
    ws.on('send', () => {
        readline.question(`Input of type '${(msg.type.type).toUpperCase()}' required: `, (msg: any) => {

            if (checkInput(msg)) {
                ws.send(msg);
            }
            else {
                ws.send(JSON.stringify(msg));
            }

        });
    });

}

mk_client(process.argv);
