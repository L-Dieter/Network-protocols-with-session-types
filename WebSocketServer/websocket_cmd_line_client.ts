// Starts a WebSocket client and connects to a server

import WebSocket from "ws";

let server_url: string = process.argv[2];
let func: string = process.argv[3];
let arg1: number = Number(process.argv[4]);
let arg2: number;
if (func === "add") {
    arg2 = Number(process.argv[5]);
}

const ws = new WebSocket(`${server_url}`);


ws.on('open', () => {
    console.log('[Client] Connected.');
    ws.send('Connected to WebSocket server');
    if (func === "neg" && !isNaN(arg1) && process.argv[5] === undefined) {
        ws.send(func);
        ws.send(arg1);
    }
    else if (func === "add" && !isNaN(arg1) && !isNaN(arg2)
        && process.argv[6] === undefined) {
        ws.send(func);
        ws.send(arg1);
        ws.send(arg2);
    }
    else {
        ws.send("invalidInput");
        for (let i = 3; i < process.argv.length; i++) {
            ws.send(process.argv[i]);
        }
        ws.send("error");
    }
    
});

ws.on('message', (data: WebSocket.Data) => {
    if (data.toString() === "closeConnection") {
        ws.close();
    }
    else {
        const prs_data: string[] = data.toString().split(" ");
        const first_symbol: string = prs_data[0];
        if (first_symbol === "#" || first_symbol === "Hello,") {
            console.log(`${data}`);
        }
        else {
            console.log(`Received a message from the server:\n ${data}`);
        }
    }
});

ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});
