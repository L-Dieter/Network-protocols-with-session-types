// Start a WebSocket server

import { WebSocketServer } from "ws";

const port = 3000;
const wss = new WebSocketServer({port});

type Session = 
        // add two numbers and terminate
    | { kind: "add", arg1: number, arg2: number, result: number, cont: "end" }
        // negate a number and terminate
    | { kind: "neg", value: number, negation: number, cont: "end" }
        // terminate protocol
    | { kind: "end" }

// parse the message and return a Session
const parseMessage = (message: string): Session => {
    const parsedMsg: string[] = message.toString().split(" ");
    const kind = parsedMsg[0];
    const arg1 = parsedMsg[1];
    if (kind === "add") {
        const arg2 = parsedMsg[2];
        return { kind: "add", arg1: +arg1, arg2: +arg2, result: +arg1 + +arg2, cont: "end" };
    } 
    else if (kind === "neg") {
        return { kind: "neg", value: +arg1, negation: -+arg1, cont: "end" };
    }
    return { kind: "end" };
}

// check the continue value of a Session and keep going with this step
const nextStep = (ses: Session): string => {
    if (ses.kind !== "end") {
        if (ses.cont === "end") {
            return "closeConnection";
        }
        else return "anotherInput";
    }
    return "closeConnection";
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message: string) => {
        console.log(`Received message from client: ${message}`);
        
        // if (message.toString() !== 'Connected to WebSocket server') {
        //     ws.send(`You sent: ${message}`);
        // }

        const msg: string[] = message.toString().split(" ");
        const firstMsg: string = msg[0].toString();

        if (firstMsg === 'Connected') {
            // do nothing
        }
        else if ((firstMsg === 'add') || (firstMsg === 'neg') || (firstMsg === 'end')) {

            const msg: Session = parseMessage(message);
            
            // decide which kind of Session is used
            switch(msg.kind) {
                    case "add": {
                        ws.send(msg.result);
                        // ws.send("anotherInput");
                        break;
                    }
                    case "neg": {
                        ws.send(msg.negation);
                        // ws.send("anotherInput");
                        break;
                    }
                    case "end": {
                        // ws.send("closeConnection");
                        break;
                    }
                    
            }
            ws.send(nextStep(msg));
        }
        else {
            ws.send(`You sent: ${message}`);
            ws.send("anotherInput");
        }
            
    });
        
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Reply to the connection of the client and ask for first input
    ws.send(`Hello, this is the Server!`);
    ws.send(`input`);

});

console.log(`Listening at ${port}...`);
