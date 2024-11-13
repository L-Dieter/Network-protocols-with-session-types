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

    

// initialize a Session based on the first input
const initSession = (input: string): Session => {
    if (input === "add") {
        return { kind: "add", arg1: 0, arg2: 0, result: 0, cont: "end" };
    } 
    else if (input === "neg") {
        return { kind: "neg", value: 0, negation: 0, cont: "end" };
    }
    else if (input === "jsonAdd") {
        return { kind: "jsonAdd", payload: { arg1: 0, arg2: 0 }, cont: "add"};
    }
    else if (input === "stringNeg") {
        return { kind: "stringNeg", payload: "", cont: "neg" };
    }
    return { kind: "end" };
}

// fill the Session with the given arguments
const fillSession = (input: number | string | JSON, ses: Session, index?: number): void => {


    if (ses.kind === "add" && typeof input === 'number') {
        switch(index) {
            case 1: {
                ses.arg1 = input;
                break;
            }
            case 2: {
                ses.arg2 = input;
                ses.result = ses.arg1 + ses.arg2;
                break;
            }
        }

    } 
    else if (ses.kind === "neg" && typeof input === 'number') {
        ses.value = input;
        ses.negation = -ses.value;
    }
    else if (ses.kind === "jsonAdd" && typeof input === 'object') {
        ses.payload.arg1 = Object.values(input)[0];
        ses.payload.arg2 = Object.values(input)[1];
    }
    else if (ses.kind === "stringNeg" && typeof input === 'string') {
        ses.payload = input;
    }

}


// check the continue value of a Session and keep goin with this step
const nextStep = (ses: Session): string => {
    if (ses.kind !== "end") {

        if (ses.cont === "end") {
            return "closeConnection";
        }

    }
    return "closeConnection";
}

// decide which kind of Session is used
const chooseSession = (ses: Session, index: number): string => {
    switch(ses.kind) {
        case "add": {
            if (index === 2) {

                return ("Result: " + ses.result);
            }
            break;
        }
        case "neg": {
            if (index === 1) {

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


// gives the client some more information about a specific operation
const helpMessage = (help: string): string => {

    let help_msg: string = "";

    switch(help) {
        case "jsonAdd": {
            help_msg = "Operation: jsonAdd\n" 
                + "Type jsonAdd <number> <number> to add two numbers out of a JSON.";
                break;
        }
        case "stringNeg": {
            help_msg = "Operation: stringNeg\n" 
                + "Type stringNeg <string> to get a written out number convertet to its equivalent number and negate it.\n"
                + "Allowed options:\n"
                + "[one, two, three, four, five, six, seven, eight, nine]";
                break;
        }
        default: { help_msg = `There is no operation with the name "${help}"`; break; }
    }
    return help_msg;

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


// check if the payload got the right type
const checkPayload = (ses: Session, input: string | JSON): boolean => {

    if (ses.kind === "jsonAdd" && typeof input === 'object') {

        const json_length: number = Object.keys(input).length;

        if (!isNaN(+Object.values(input)[0]) && !isNaN(+Object.values(input)[1]) && json_length === 2) {
            return true;
        }
    }
    else if (ses.kind === "stringNeg" && typeof input === 'string') {

        let is_str_number: boolean;

        switch(input) {
            case "one": { is_str_number = true; break; }
            case "two": { is_str_number = true; break; }
            case "three": { is_str_number = true; break; }
            case "four": { is_str_number = true; break; }
            case "five": { is_str_number = true; break; }
            case "six": { is_str_number = true; break; }
            case "seven": { is_str_number = true; break; }
            case "eight": { is_str_number = true; break; }
            case "nine": { is_str_number = true; break; }
            default: { is_str_number = false; break; }
        }

        return is_str_number;
    }

    return false;
}

// handle the payload given by the session
const handlePayload = (ses: Session): Session => {

    let cont_ses: Session;

    if (ses.kind === "jsonAdd") {

        cont_ses = initSession("add");

        if (cont_ses.kind === "add") {
            
            fillSession(+ses.payload.arg1, cont_ses, 1)
            fillSession(+ses.payload.arg2, cont_ses, 2)
            return ses = cont_ses;
        }
    }

    else if (ses.kind === "stringNeg") {
        
        cont_ses = initSession("neg");

        if (cont_ses.kind === "neg") {

            fillSession(nameToNumber(ses.payload), cont_ses);
            return ses = cont_ses;
        }
    }

    return ses;

}



wss.on('connection', (ws) => {
    console.log('Client connected');
    
    let inc_msg: string[] = [];
    let index: number = -1;
    let ses: Session = { kind: "end" };
    

    ws.on('message', (message: string) => {

        
        console.log(`Received message from client: ${message}`);
        
        const msg: string = message.toString();

        // check if the Session has to be initialized or filled in
        if (index === 0 && msg !== "help") {

            ses = initSession(msg);
        }
        else if (!isNaN(+msg) && (ses.kind === "add" || ses.kind === "neg")) {
            
            fillSession(+msg, ses, index);
        }
        else if (ses.kind === "jsonAdd") {
            
            let check_json: JSON = JSON.parse(msg);
            if (!checkPayload(ses, check_json)) {
                ws.send("Payload doesnt fit the requirement");
                ws.send("closeConnection");
            }
            else {
                fillSession(check_json, ses);
                ses = handlePayload(ses);
                index = 2;
            }
        }
        else if (ses.kind === "stringNeg") {

            if (!checkPayload(ses, msg)) {
                ws.send("Payload doesnt fit the requirement");
                ws.send("closeConnection");
            }
            else {
                fillSession(msg, ses);
                ses = handlePayload(ses);
                index = 1;
            }

        }

        
        // push the message to the stack if it is an operation
        if (msg !== 'Connected to WebSocket server') {
            inc_msg.push(msg);
            console.log(inc_msg);
        }


        if (index === 1 || index === 2) {

            const return_message: string = chooseSession(ses, index);

            if (inc_msg[0] === "help") {
                ws.send(helpMessage(msg));
                ws.send("closeConnection");
            }
            else if (return_message === "waiting") {
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


        if (inc_msg[inc_msg.length-1] === "error") {

            ws.send(`# Invalid input: ${invalidMessage(inc_msg)}`);
            ws.send(`# Allowed operation(s):`);
            ws.send(`#    .. <serverurl> add <number> <number>`);
            ws.send(`#    .. <serverurl> neg <number>`);
            ws.send(`#    .. <serverurl> jsonAdd <number> <number>`);
            ws.send(`#    .. <serverurl> stringNeg <string>`);
            ws.send(`#    For more information on 'jsonAdd' or 'stringNeg' type "help <Operation>"`);
            inc_msg = [];
            ws.send(`closeConnection`);
        }

        index++;

            
    });
        
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    
    // Reply to the connection of the client
    ws.send(`Hello, this is the Server!`);

});

console.log(`Listening at ${port}...`);
