// Starts a WebSocket client and connects to a server

import WebSocket from "ws";

let server_url: string = process.argv[2];
let func: string = process.argv[3];
let arg1: number;
let arg2: number;
let json_arg: JSON;
let string_arg: string;

let msg_to_send: any[] = [];

const ws = new WebSocket(`${server_url}`);



// generate a message for an invalid input
const createInvalidMessage = (): string => {
    let msg: string[] = [];
    let i: number = 3;
    let return_message: string = "";

    while (process.argv[i] !== undefined) {
        msg.push(process.argv[i]);
        i++;
    }

    if (msg.length > 5) {
        for (let i = 0; i < 5; i++) {
            return_message += " " + msg[i];
        }
        return_message += " " + `... [${msg.length-5} more]`;
    }
    else {
        for (let i = 0; i < msg.length; i++) {
            return_message += " " + msg[i];
        }
    }
    return return_message;
}

// print the message for an invalid input on the terminal and give some information about valid options
const getErrorMessage = (): void => {
    console.log(`   # Invalid input: ${createInvalidMessage()}`);
    console.log(`   # Allowed operation(s):`);
    console.log(`   #    .. <serverurl> add <number> <number>`);
    console.log(`   #    .. <serverurl> neg <number>`);
    console.log(`   #    .. <serverurl> jsonAdd <number> <number>`);
    console.log(`   #    .. <serverurl> stringNeg <string>`);
    console.log(`   #    For more information on 'jsonAdd' or 'stringNeg' type "help <Operation>"`);
    ws.close();
}

// decide what to send
const getMessage = (): void => {
    switch(func) {
        case "neg": {
            arg1 = Number(process.argv[4]);
            if (!isNaN(arg1) && process.argv[5] === undefined) {
                msg_to_send.push(func);
                msg_to_send.push(arg1);
            }
            else {
                getErrorMessage();
            }
            break;
        }
        case "add": {
            arg1 = Number(process.argv[4]);
            arg2 = Number(process.argv[5]);
            if (!isNaN(arg1) && !isNaN(arg2)
                && process.argv[6] === undefined) {
                msg_to_send.push(func);
                msg_to_send.push(arg1);
                msg_to_send.push(arg2);
            }
            else {
                getErrorMessage();
            }
            break;
        }
        case "jsonAdd": {
    
            if (!isNaN(+process.argv[4]) && !isNaN(+process.argv[5])) {
                
                json_arg = JSON.parse(`{ "arg1": ${process.argv[4]}, "arg2": ${process.argv[5]} }`);
            }
            else {
    
                json_arg = JSON.parse('{"nothing": 0}');
            }
    
            if (process.argv[6] === undefined) {
                msg_to_send.push(func);
                msg_to_send.push(JSON.stringify(json_arg));
            }
            else {
                getErrorMessage();
            }
            break;
        }
        case "stringNeg": {
            string_arg = process.argv[4];
            if (process.argv[5] === undefined) {
                msg_to_send.push(func);
                msg_to_send.push(string_arg);
            }
            else {
                getErrorMessage();
            }
            break;
        }
        case "help": {
            string_arg = process.argv[4];
            if (process.argv[5] === undefined) {
                msg_to_send.push(func);
                msg_to_send.push(string_arg);
            }
            else {
                getErrorMessage();
            }
            break;
        }
        default: {
            getErrorMessage();
            break;
        }
    
    }

}

// send the message one by one
const sendMessage = (): void => {
    for (let i = 0; i < msg_to_send.length; i++) {
        ws.send(msg_to_send[i]);
    }    
}



ws.on('open', () => {
    console.log('[Client] Connected.');

    getMessage();

    if (msg_to_send.length !== 0) {
        ws.send('Connected to WebSocket server');
        sendMessage();
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
