// Start a WebSocket server

import { WebSocketServer } from "ws";
import { Type, Dir, Label, Session, Program } from './protocol';

const port = 3000;
const wss = new WebSocketServer({port});

const operations: string[] = [
    "add",
    "neg",
    "jsonAdd",
    "stringNeg"
]


const mk_adder = (): Program => {
    var arg1: number, arg2: number;
    return {
        command: "recv",
        put_value: (v: any) => arg1 = v,
        cont: { command: "recv",
            put_value: (v: any) => arg2 = v,
            cont: { command: "send",
                get_value: () => arg1 + arg2,
                cont: {
                    command: "end"
                }
            }
        }
    }
}

const mk_neg = (): Program => {
    var arg: number;
    return {
        command: "recv",
        put_value: (v: any) => arg = v,
        cont: {
            command: "send",
            get_value: () => -arg,
            cont: {
                command: "end"
            }
        }
    }
}

const mk_arith = (): Program => {
    return {
        command: "choose",
        do_match: (label: Label) => null,
        alt_cont: {
            add: mk_adder(),
            neg: mk_neg()
        }
    }
}

const mk_jsonAdd = (): Program => {
    var v_add: { arg1: number, arg2: number};
    return {
        command: "recv",
        put_value: (v: any) => v_add = v,
        cont: {
            command: "send",
            get_value: () => v_add.arg1 + v_add.arg2,
            cont: {
                command: "end"
            }
        }
    }
}

const mk_stringNeg = (): Program => {
    var arg: string;
    return {
        command: "recv",
        put_value: (v: any) => arg = v,
        cont: {
            command: "send",
            get_value: () => -nameToNumber(arg),
            cont: {
                command: "end"
            }
        }
    }
}



// update the session
const updateSession = (ses: Session,  val: { payload?: any, label?: string } ): void => {
    let new_ses: Session = { kind: "end" };
    if (ses.kind === "single") {
        if (ses.program.command !== "end") {
            if (ses.program.command !== "choose") {
                ses.program = ses.program.cont;
            } 
            else if (typeof val.label === 'string') {
                ses.program = ses.program.alt_cont[val.label];
            }
        } 
        if (ses.program.command === "recv") {
            ses.dir = "recv";
            // ses.payload = payload;
        }
        else if (ses.program.command === "send") {
            ses.dir = "send";
            // ses.payload = ses.program.get_value();
        }
        else if (ses.program.command === "end") {
            if (ses.cont.kind !== "end") {
                ses = ses.cont;
            }
        }
    }
    else if (ses.kind === "choice") {
        if (typeof val.label === 'string') {
            if (ses.alt_program[val.label.concat("_cont")]) {
                const new_prog: Program = ses.alt_program[val.label.concat("_cont")];
                if (new_prog.command !== "choose" && new_prog.command !== "end") {
                    ses.alt_program[val.label.concat("_cont")] = new_prog.cont;
                }
                else if (new_prog.command === "choose") {
                    ses.alt_program[val.label.concat("_cont")] = new_prog.alt_cont[val.label];
                }
                if (new_prog.command === "recv") {
                    ses.dir = "recv";
                    // ses.payload = payload;
                }
                else if (new_prog.command === "send") {
                    ses.dir = "send";
                    // ses.payload = ses.program.get_value();
                }
                else if (new_prog.command === "end") {
                    if (ses.alternatives[val.label]) {
                        ses = ses.alternatives[val.label];
                    }
                }
            }
            else if (ses.alt_program[val.label].command !== "end") {
                ses.alt_program[val.label.concat("_cont")] = ses.alt_program[val.label]
            }
            else {
                ses = ses.alternatives[val.label];
                // new_ses = initSession("single");
            }
        }
        // new_ses = initSession("single");
        // else if (new_ses.kind === "single" && typeof val.label === 'string') {
        //     new_ses.program = ses.alt_program[val.label];
        //     ses = new_ses;
        //     updateSession(ses, {});
        // }
    }
}

// init session
const initSession = (kind: string): Session => {
    if (kind === "single") {

        return { kind: kind, dir: "recv", payload: { type: "null" } ,
                program: { command: "end"}, cont: { kind: "end"} }
    }
    else if (kind === "choice") {

        return { kind: kind, dir: "recv", alt_program: {},
                alternatives:  {} }
    }
    return { kind: 'end' }
}

// fill the Session with the given arguments
const fillSession = (ses: Session, program: Program): void => {
    if (ses.kind === "single") {
        ses.program = program;
    }
}

const chooseSession = (kind: string): Session => {
    let ses: Session;
    switch (kind) {
        case "add": {
            ses = initSession("single");
            fillSession(ses, mk_adder());
            break;
        }
        case "neg": {
            ses = initSession("single");
            fillSession(ses, mk_neg());
            break;
        }
        case "arith": {
            ses = initSession("single");
            fillSession(ses, mk_arith());
            break;
        }
        case "jsonAdd": {
            ses = initSession("single");
            fillSession(ses, mk_jsonAdd());
            break;
        }
        case "stringNeg": {
            ses = initSession("single");
            fillSession(ses, mk_stringNeg());
            break;
        }
        default: {
            ses = initSession("choice");
            break;
        }
    }
    return ses;
}

// check if the payload got the right type
const checkPayload = (ses: Session, input: string | JSON): boolean => {


    if (ses.kind === "single" && typeof input === 'object') {

        const json_length: number = Object.keys(input).length;

        if (!isNaN(+Object.values(input)[0]) && !isNaN(+Object.values(input)[1]) && json_length === 2) {
            return true;
        }


    }
    else if (ses.kind === "single" && typeof input === 'string') {

        let is_str_number: boolean;

        switch (input) {
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





wss.on('connection', (ws) => {
    console.log('Client connected');
    
    let ses: Session = { kind: "end" };
    let first_msg: string;
    

    // incoming message of type RawData
    ws.on('message', (message) => {

        
        console.log(`Received message from client: ${message}`);
        
        let msg: string = message.toString();

        if (operations.includes(msg)) {
            ses = chooseSession(msg);
            first_msg = msg;
        }


        // sessions of type "single"
        // case: arithmetic operation
        if (ses.kind === "single" && !isNaN(+msg) && (first_msg === "add" || first_msg === "neg")) {
            if (ses.dir === "recv") {
                if (ses.program.command === "recv") {
                    ses.program.put_value(+msg);
                }
                updateSession(ses, {});
            }

            if (ses.dir === "send") {
                if (ses.program.command === "send") {
                    ws.send(+ses.program.get_value());
                }
                updateSession(ses, {});
            }

            if (ses.program.command === "end" && ses.cont.kind === "end") {
                ws.send("closeConnection");
            }

        }
        // case: different inputs than numbers
        else if (ses.kind === "single" && !operations.includes(msg) && (first_msg === "jsonAdd" || first_msg === "stringNeg")) {
            if (isNaN(+msg) && first_msg === "stringNeg") {
                if (checkPayload(ses, msg)) {
                    if (ses.dir === "recv") {
                        if (ses.program.command === "recv") {
                            ses.program.put_value(msg);
                        }
                        updateSession(ses, {});
                    }
        
                    if (ses.dir === "send") {
                        if (ses.program.command === "send") {
                            ws.send(ses.program.get_value());
                        }
                        updateSession(ses, {});
                    }
                }
                else {
                    ws.send("Wrong input");
                    ws.send("closeConnection");
                }
            }
            else if (typeof JSON.parse(msg) === 'object') {
                if (checkPayload(ses, JSON.parse(msg))) {
                    if (ses.dir === "recv") {
                        if (ses.program.command === "recv") {
                            ses.program.put_value(JSON.parse(msg));
                        }
                        updateSession(ses, {});
                    }
        
                    if (ses.dir === "send") {
                        if (ses.program.command === "send") {
                            ws.send(ses.program.get_value());
                        }
                        updateSession(ses, {});
                    }
                }
                else {
                    ws.send("Wrong input");
                    ws.send("closeConnection");
                }

            }
            else {
                ws.send("Wrong input");
                ws.send("closeConnection");
            }


            if (ses.program.command === "end" && ses.cont.kind === "end") {
                ws.send("closeConnection");
            }

        }
        else if (ses.kind === "single") {
            if (ses.program.command === "choose") {
                updateSession(ses, { label: msg });
            }
        }
        // sessions of type "choice"
        else if (ses.kind === "choice") {
            if (ses.dir === "recv") {
                if (ses.alt_program[msg] === mk_adder()) {
                    ses = chooseSession("add");
                }
                else if (ses.alt_program[msg] === mk_neg()) {
                    ses = chooseSession("neg");
                }
            }
        }

            
    });
        
    ws.on('close', () => {
        console.log('Client disconnected');
    });

});

console.log(`Listening at ${port}...`);
