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
                msg_to_send.push(json_arg);
            }
            else {
                getErrorMessage();
            }
            break;
        }
        case "stringNeg": {
            string_arg = process.argv[4];
            if (process.argv[5] === undefined) {
                msg_to_send.push(string_arg);
            }
            else {
                getErrorMessage();
            }
            break;
        }
        case "test": {
            for (let i = 4; i < process.argv.length; i++) {
                if (!isNaN(+process.argv[i])) {
                    msg_to_send.push(+process.argv[i]);
                }
                else {
                    msg_to_send.push(process.argv[i]);
                }
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
        setTimeout(() => ws.send(JSON.stringify(msg_to_send[i])), 100 * (i + 1));
    }    
}



ws.on('open', () => {
    console.log('[Client] Connected.');

    getMessage();

    if (msg_to_send.length !== 0) {
        sendMessage();
    }

    
});

ws.on('message', (data: any) => {
    let msg: any = JSON.parse(data);
    if (msg === "closeConnection") {
        ws.close();
    }
    else {
        if (typeof msg === 'string') {
            const prs_data: string[] = msg.split(" ");
            const first_symbol: string = prs_data[0];
            if (first_symbol === "#" || first_symbol === "Hello,") {
                console.log(`${msg}`);
            }
            else {
                console.log(`Received a message from the server:\n ${msg}`);
            }
        }
        else {
            console.log(`Received a message from the server:\n ${msg}`);
        }
    }
});

ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});
