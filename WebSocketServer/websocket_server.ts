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
    let inc_msg: string[] = [];

    ws.on('message', (message: string) => {
        console.log(`Received message from client: ${message}`);
        
        const msg: string = message.toString();
        
        let first_msg: string = "Connected";
            
        if (msg !== 'Connected to WebSocket server') {
            inc_msg.push(msg);
            first_msg = inc_msg[0];
        }


        if (first_msg === 'Connected') {
            // do nothing
        }
        else if ((first_msg === 'add') || (first_msg === 'neg') || (first_msg === 'end')) {

            const ses: Session = getSession(inc_msg);
            
            // decide which kind of Session is used
            switch(ses.kind) {
                    case "add": {
                        if (inc_msg.length === 3) {
                            ws.send("Result: " + ses.result);
                        }
                        // ws.send("anotherInput");
                        break;
                    }
                    case "neg": {
                        if (inc_msg.length === 2) {
                            ws.send("Negation: " + ses.negation);
                        }
                        // ws.send("anotherInput");
                        break;
                    }
                    case "end": {
                        // ws.send("closeConnection");
                        break;
                    }
                    
            }
            ws.send(nextStep(ses));
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
