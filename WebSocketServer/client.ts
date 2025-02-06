// Starts a WebSocket client and connects to a server

import WebSocket from "ws";


// generate a message for an invalid input
const createInvalidMessage = (): string => {
    let msg: string[] = [];
    let i: number = 3;
    let return_message: string = "";

    while (process.argv[i] !== undefined) {
        msg.push(process.argv[i]);
        i++;
    }

    // shorten the message if there are too many inputs
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
const getErrorMessage = (ws: WebSocket): void => {
    console.log(`   # Invalid input: ${createInvalidMessage()}`);
    console.log(`   # Allowed operation(s):`);
    console.log(`   #    .. <serverurl> add <number> <number>`);
    console.log(`   #    .. <serverurl> neg <number>`);
    console.log(`   #    .. <serverurl> jsonAdd <number> <number>`);
    console.log(`   #    .. <serverurl> stringNeg <string>`);
    console.log(`   #    .. <serverurl> test <any> ...`);
    ws.close();
}

// decide what to send based on a "function" name
const getMessage = (func: string, ws: WebSocket): any[] => {
    let msg_to_send: any[] = [];
    switch(func) {
        case "neg": {
            const arg1 = Number(process.argv[4]);
            if (!isNaN(arg1) && process.argv[5] === undefined) {
                msg_to_send.push(arg1);
            }
            else {
                getErrorMessage(ws);
            }
            break;
        }
        case "add": {
            const arg1 = Number(process.argv[4]);
            const arg2 = Number(process.argv[5]);
            if (!isNaN(arg1) && !isNaN(arg2)
                && process.argv[6] === undefined) {
                msg_to_send.push(arg1);
                msg_to_send.push(arg2);
            }
            else {
                getErrorMessage(ws);
            }
            break;
        }
        case "jsonAdd": {

            let json_arg: JSON;
    
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
                getErrorMessage(ws);
            }
            break;
        }
        case "stringNeg": {
            const string_arg = process.argv[4];
            if (process.argv[5] === undefined) {
                msg_to_send.push(string_arg);
            }
            else {
                getErrorMessage(ws);
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
            getErrorMessage(ws);
            break;
        }
    
    }

    return msg_to_send;

}

// send the message one by one with a slight delay
const sendMessage = (msg_to_send: any[], ws: WebSocket): void => {
    for (let i = 0; i < msg_to_send.length; i++) {
        setTimeout(() => ws.send(JSON.stringify(msg_to_send[i])), 100 * (i + 1));
    }
}

// create a new client
const mk_client = (cmd_line: any): void  => {

    // insert the server url
    const ws = new WebSocket(`${cmd_line[2]}`);

    // get the message from the terminal and send it at the time the client starts
    ws.on('open', () => {
        console.log('[Client] Connected.');
    
        const msg: any[] = getMessage(cmd_line[3], ws);
    
        if (msg.length !== 0) {
            sendMessage(msg, ws);
        }
    
        
    });
    
    // print the received message to the terminal
    ws.on('message', (data: any) => {
    
        let msg: any = JSON.parse(data);
    
        console.log(`Received a message from the server:\n ${msg}`);
    
    });
    
    // get a notification when the connection to the server ends
    ws.on('close', () => {
        console.log('Disconnected from WebSocket server');
    });

}


mk_client(process.argv);
