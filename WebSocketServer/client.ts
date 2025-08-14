// Starts a WebSocket client and connects to a server

import WebSocket from "ws";
import { Type } from './protocol';
import * as readline from 'readline';
import { getHelpText } from "./src/misc/helpText";

// Set up a readline interface to be able to answer a request from the server
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// create a new client
function mk_client (cmd_line: string[]): void {

    // check if the initial amount of arguments is correct
    if (cmd_line.length === 2) {
        console.log(getHelpText());
        rl.close();
        return;
    }
    else if (cmd_line.length !== 3) {
        console.error("Invalid parameter. Check your input!");
        rl.close();
        return;
    }

    // open a connection with a server
    const ws: WebSocket = new WebSocket(`${cmd_line[2]}`);

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
        rl.close();
    });

    // open a readline if needed
    ws.on('send', () => {

        // info message to know what input is required
        let info: string = "";

        // input needs to be a label
        if (msg.content) {
            info = `Label of type '${(msg.content)}' required: `;
        }
        // input needs to be of the given type
        else {
            info = `Input of type '${(msg.type.type).toUpperCase()}' required: `;
        }

        rl.question(info, (msg: string) => {

            ws.send(msg);

        });

    });

}

mk_client(process.argv);
