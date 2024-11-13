// Starts a WebSocket client and connects to a server

import WebSocket from "ws";

let server_url: string = process.argv[2];
let func: string = process.argv[3];
let arg1: number;
let arg2: number;
let json_arg: JSON;
let string_arg: string;

switch(func) {
    case "neg": {
        arg1 = Number(process.argv[4]);
    }
    case "add": {
        arg1 = Number(process.argv[4]);
        arg2 = Number(process.argv[5]);
    }
    case "jsonAdd": {

        if (!isNaN(+process.argv[4]) && !isNaN(+process.argv[5])) {
            
            json_arg = JSON.parse(`{ "arg1": ${process.argv[4]}, "arg2": ${process.argv[5]} }`);
        }
        else {

            json_arg = JSON.parse('{"nothing": 0}');
        }
    }
    case "stringNeg": {
        string_arg = process.argv[4];
    }
    case "help": {
        string_arg = process.argv[4];
    }

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
    else if (func == "jsonAdd" && process.argv[6] === undefined) {
        ws.send(func);
        ws.send(JSON.stringify(json_arg));
    }
    else if (func === "stringNeg" && process.argv[5] === undefined) {
        ws.send(func);
        ws.send(string_arg);
    }
    else if (func === "help" && process.argv[5] === undefined) {
        ws.send(func);
        ws.send(string_arg);
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
