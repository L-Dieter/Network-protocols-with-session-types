// Start a WebSocket server

import { WebSocketServer } from "ws";

const port = 3000;
const wss = new WebSocketServer({port});

type Add = {
    arg1: number
    arg2: number
}

type Session = 
        // add two numbers and terminate
    | { kind: "add", arg1: number, arg2: number, result: number, cont: "end" }
        // negate a number and terminate
    | { kind: "neg", value: number, negation: number, cont: "end" }
        // take two numbers out of a JSON file and continue with add
    | { kind: "jsonAdd", payload: Add, cont: "add" }
        // take a string and convert it to a number, then continue with neg
    | { kind: "stringNeg", payload: string, cont: "neg" }
        // terminate protocol
    | { kind: "end" }


// get the Session which is indicated by the first input
const getSession = (input: string[]): Session => {
    if (input[0] === "add") {
        return { kind: "add", arg1: +input[1], arg2: +input[2], result: +input[1] + +input[2], cont: "end" };
    } 
    else if (input[0] === "neg") {
        return { kind: "neg", value: +input[1], negation: -+input[1], cont: "end" };
    }
    return { kind: "end" };
}


// check the continue value of a Session and keep goin with this step
const nextStep = (ses: Session): string => {
    if (ses.kind !== "end") {
        // return ses.cont;
        if (ses.cont === "end") {
            return "closeConnection";
        }
        else return "anotherInput";
    }
    // return "end";
    return "closeConnection";
}

// decide which kind of Session is used
const chooseSession = (ses: Session, msg: string[]): string => {
    switch(ses.kind) {
        case "add": {
            if (msg.length === 3) {
                return ("Result: " + ses.result);
            }
            break;
        }
        case "neg": {
            if (msg.length === 2) {
                return ("Negation: " + ses.negation);
            }
            break;
        }
        case "end": {
            return nextStep(ses);
        }
    }
    return "waiting";
}

// check the input and generate a message for an invalid input which will be returned to the client
const invalidMessage = (msg: string[]): string => {
    let return_message: string = "";
    if (msg.length > 5) {
        for (let i = 1; i < 5; i++) {
            return_message += " " + msg[i];
        }
        return_message += " " + `... [${msg.length-6} more]`;
    }
    else {
        for (let i = 1; i < msg.length-1; i++) {
            return_message += " " + msg[i];
        }
    }
    return return_message;
}

// turns a written out number to a number (only 1 - 9)
const nameToNumber = (name: string): number => {
    let num: number;
    switch(name) {
        case "one": { num = 1; break; }
        case "two": { num = 2; break; }
        case "three": { num = 3; break; }
        case "four": { num = 4; break; }
        case "five": { num = 5; break; }
        case "six": { num = 6; break; }
        case "seven": { num = 7; break; }
        case "eight": { num = 8; break; }
        case "nine": { num = 9; break; }
        default: { num = 0; break; }
    }
    return num;
}

// handle the payload given by the session
const handlePayload = (ses: Session) => {

    let continue_value: string[] = [];

    if (ses.kind === "jsonAdd") {

        continue_value.push(ses.cont);
        continue_value.push((ses.payload.arg1).toString());
        continue_value.push((ses.payload.arg2).toString());
    }

    else if (ses.kind === "stringNeg") {

        continue_value.push(ses.cont);
        continue_value.push(nameToNumber(ses.payload).toString());
    }

    console.log(continue_value);
    console.log(chooseSession(getSession(continue_value), continue_value));

    chooseSession(getSession(continue_value), continue_value);
    continue_value = [];

}


wss.on('connection', (ws) => {
    console.log('Client connected');
    
    let inc_msg: string[] = [];

    ws.on('message', (message: string) => {

        
        console.log(`Received message from client: ${message}`);
        
        const msg: string = message.toString();
        
        let first_msg: string = "Connected";

        let invalid_input: string = "";
        
        // push the message to the stack if it is an operation
        if (msg !== 'Connected to WebSocket server') {
            inc_msg.push(msg);
            first_msg = inc_msg[0];
            console.log(inc_msg);
        }

        if (first_msg === 'Connected') {
            // do nothing
        }
        else if ((first_msg === 'add') || (first_msg === 'neg') || (first_msg === 'end')) {

            const ses: Session = getSession(inc_msg);
            const return_message: string = chooseSession(ses, inc_msg);

            if (return_message === "waiting") {
                // do nothing
            }
            else if (return_message === "closeConnection") {
                ws.send(return_message);

            }
            else if (return_message.startsWith("Result") || return_message.startsWith("Negation")) {
                ws.send(return_message);
                ws.send(nextStep(ses));
            }
        }
        else if (first_msg === "invalidInput") {
            invalid_input = invalidMessage(inc_msg);
        }
        if (inc_msg[inc_msg.length-1] === "error") {
            ws.send(`# Invalid input: ${invalid_input}`);
            ws.send(`# Allowed operation(s):`);
            ws.send(`#    .. <serverurl> add <number> <number>`);
            ws.send(`#    .. <serverurl> neg <number>`);
            inc_msg = [];
            ws.send(`closeConnection`);
        }
            
    });
        
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    
    // Reply to the connection of the client
    ws.send(`Hello, this is the Server!`);

});

console.log(`Listening at ${port}...`);
