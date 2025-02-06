// Start a WebSocket server

import { WebSocketServer } from "ws";
import { Type, Dir, Label, Session, Program } from './protocol';
import * as programs from './programs';


// update the session
const updateSession = (ses: Session, p: Program, label?: string): Session => {

    if (ses.kind === "single") {
        if (p.command === "recv") {
            ses.dir = "recv";
        }
        else if (p.command === "send") {
            ses.dir = "send";
        }
        else if (p.command === "choose") {
            ses = ses.cont;
        }
        else if (p.command === "end") {
            ses = ses.cont;
        }
    }
    else if (ses.kind === "choice") {
        if (p.command === "recv") {
            ses.dir = "recv";
        }
        else if (p.command === "send") {
            ses.dir = "send";
        }
        else if (p.command === "choose" && label) {
            ses = ses.alternatives[label];
        }
        else if (p.command === "end" && label) {
            ses = ses.alternatives[label];
        }
    }

    return ses;

}

// update the program
const updateProgram = (p: Program, val?: { value?: any, label?: string }): Program => {

    if (p.command !== "end" && p.command !== "choose") {
        if (p.command === "recv" && val?.value) {
            p.put_value(val.value);
        }

        p = p.cont;

    }
    else if (p.command === "choose" && val?.label) {
        p.do_match(val.label);
        p = p.alt_cont[val.label];
    }

    return p;

}

// initialize a session based on the input string
const initSession = (kind: string): Session => {
    if (kind === "single") {

        return { kind: kind, dir: "recv", payload: { type: "null" }, cont: { kind: "end"} };
    }
    else if (kind === "choice") {

        return { kind: kind, dir: "recv", alternatives:  { end: { kind: "end" } } };
    }
    return { kind: "end" };
}

// fill the Session with the given arguments
const fillSession = (ses: Session, payload?: Type, cont?: Session): void => {
    if (ses.kind !== "end" && payload) {
        if (payload && ses.kind === "single") {
            ses.payload = payload;
        }

        if (cont && ses.kind === "single") {
            ses.cont = cont;
        }
    }
}

// get a program out of a list based on a input string
const getProgram = (p: string, s: Session): Program => {

    const lower_prog: string = p.toLowerCase();
    let prog: Program;

    switch (lower_prog) {
        case "mk_adder": {
            prog = programs.mk_adder();
            fillSession(s, { type: "number" });
            break;
        }
        case "mk_neg": {
            prog = programs.mk_neg();
            fillSession(s, { type: "number" });
            break;
        }
        case "mk_arith": {
            prog = programs.mk_arith();
            fillSession(s, { type: "string" }, {
                kind: "single",
                dir: "recv",
                payload: { type: "number" },
                cont: { kind: "end" }
            });
            break;
        }
        case "mk_jsonadd": {
            prog = programs.mk_jsonAdd();
            fillSession(s, { type: "record", payload: { "arg1": { type: "number" }, "arg2": { type: "number" } } });
            break;
        }
        case "mk_stringneg": {
            prog = programs.mk_stringNeg();
            fillSession(s, { type: "any" });
            break;
        }
        default: {
            return { command: "end" };
        }
    }

    return prog;
}

// check if the session and the program fit together
const checkSession = (s: Session, p: Program): Promise<void> => {

    var valid_session: boolean = false;
    
    if (s.kind !== "end") {
        if (p.command === "recv" && s.dir !== "recv") {
            valid_session = false;
        }
        else if (p.command === "send" && s.dir !== "send") {
            valid_session = false;
        }
        else {
            valid_session = true;
        }
    }

    if (valid_session) {
        return Promise.resolve();
    }
    else {
        return Promise.reject('Session and program do not fit together');
    }
}

// check the program and do another step if possible
const continueProgram = (p: Program, wss: WebSocketServer, label?: Label): Promise<void> => {

    switch (p.command) {
        case "send": {
            wss.emit('send');
            break;
        }
        case "recv":{
            break;
        }
        case "select":{
            wss.emit('select');
            break;
        }
        case "choose":{
            if (label) {
                wss.emit('choose', label);
            }
            break;
        }
        case "end":{
            wss.emit('end');
            break;
        }
        default: {
            Promise.reject("Not a valid command");
        }
    }

    return Promise.resolve();    
}



// check if the input and a payload type fit together
const checkPayload = async (input: any, type: Type, lap?: boolean): Promise<boolean> => {

    let valid_payload: boolean = false;
    let union_lap: boolean = false;

    if (lap) {
        union_lap = lap;
    }

    switch (type.type) {
        case "string": if (typeof input === "string") { valid_payload = true; } break;
        case "number": if (typeof input === "number") { valid_payload = true; } break;
        case "bool": if (typeof input === "boolean") { valid_payload = true; } break;
        case "any": valid_payload = true; break;
        case "null": if (input === null) { valid_payload = true; } break;
        case "union": {
            const union: Type[] = type.components;
            for (let i = 0; i < union.length; i++) {
                if (await checkPayload(input, union[i], true)) {
                    valid_payload = true;
                    union_lap = false;
                    break;
                }
            }
            union_lap = false;
            break;
        }
        case "record": {
            if (typeof input === "object" && !Array.isArray(input)) {
                const type_keys: string[] = Object.keys(type.payload);
                const input_keys: string[] = Object.keys(input);
                for (let i = 0; i < type_keys.length; i++) {
                    valid_payload = await checkPayload(input[input_keys[i]], type.payload[type_keys[i]]);
                }
            }
            break;
        }
        case "tuple": {
            if (Array.isArray(input)) {
                for (let i = 0; i < type.payload.length; i++) {
                    valid_payload = await checkPayload(input[i], type.payload[i]);
                }

            }
            break;
        }
        case "array": {
            if (Array.isArray(input)) {
                for (let i = 0; i < input.length; i++) {
                    valid_payload = await checkPayload(input[i], type.payload);
                }
            }
            break;
        }
        case "ref": if (typeof input === "string") { valid_payload = true; } break;
        default: valid_payload = false;

    }


    if (valid_payload) {
        return Promise.resolve(true);
    }
    else if (union_lap) {
        return Promise.resolve(false);
    }
    else {
        return Promise.reject('Invalid payload');
    }

}


// start the server with a given program and session
const mk_server = async (cmd_line: any): Promise<void> => {


    const port = 3000;
    const wss = new WebSocketServer({port});

    const mk_program: string | Program = cmd_line[2];
    const mk_session: string | Session = cmd_line[3];

    let program: Program;
    let session: Session;
    let client: any;

    if (typeof mk_session === "string") {
        session = initSession(mk_session);
    }
    else {
        session = mk_session;
    }

    if (typeof mk_program === "string") {
        program = getProgram(mk_program, session);
    }
    else {
        program = mk_program;
    }

    try {

        await checkSession(session, program);

    }
    catch (error) {

        console.error(error);

        wss.close();

    }

    console.log(`Listening at ${port}...`);


    wss.on('connection', async (ws) => {

        client = ws;

        // if no message is needed move on with the program
        if (program.command !== "recv" && program.command !== "choose") {
            await continueProgram(program, wss);
        }

    
        // incoming message of any type
        ws.on('message', async (message: any) => {

            let msg: any = JSON.parse(message);

            // check payload if possible
            if (session.kind === "single") {
                try {
                    await checkPayload(msg, session.payload);
                }
                catch (error) {
                    console.error(error);
                    ws.close();
                    wss.close();
                }
            }

            // use the message to continue with the program and session
            if (session.kind !== "end") {
                if (session.dir !== "recv" && program.command !== "end") {
                    await continueProgram(program, wss);
                }
                else if (program.command === "choose") {
                    wss.emit('choose', msg);
                }
                else if (program.command === "recv") {
                    wss.emit('recv', msg);
                }
                else if (session.kind === "choice") {
                    wss.emit('recv', msg);
                }
            }

        });

            
        ws.on('close', () => {
            // console.log('Client disconnected');
        });

    
    });

    
    // "recv" operation of the program and session
    wss.on('recv', async (msg: any) => {
    
        // use the message for the program if it needs to receive one, otherwise update a "choice" session
        if (session.kind !== "end") {
            if (program.command === "recv") {
                program.put_value(msg);
                program = updateProgram(program, { value: msg });
                session = updateSession(session, program);
            }
            else if (session.kind === "choice") {
                session = updateSession(session, program, msg);
            }
        }
    
        // continue with the next step
        if (session.kind !== "end") {
            await continueProgram(program, wss);
        }
        else {
            wss.emit('end');
        }
    });

    // "send" operation of the program and session
    wss.on('send', async () => {
    
        // get the operation done
        if (session.kind !== "end") {
            if (program.command === "send") {
                client.send(JSON.stringify(program.get_value()));
            }
            program = updateProgram(program);
            session = updateSession(session, program);
        }
    
        // continue with the next step
        if (session.kind !== "end") {
            await continueProgram(program, wss);
        }
        else {
            wss.emit('end');
        }
    });
    
    // "select" operation of the program
    wss.on('select', async () => {
    
        // use the selected value for the program or as a label to continue with the next session
        if (session.kind !== "end") {
            if (program.command === "select" && program.cont.command === "choose") {
                const select: string = program.get_value();
                program = updateProgram(program);
                await continueProgram(program, wss, select);
            }
            else if (session.kind === "choice") {
                if (program.command === "select" && program.cont.command === "end") {
                    session = updateSession(session, program, program.get_value());
                }
            }
            else {
                program = updateProgram(program);
                await continueProgram(program, wss);
            }
        }
        else {
            wss.emit('end');
        }
    });
    
    // "choose" operation of the program
    wss.on('choose', async (l: Label) => {
    
        // get the operation done
        if (session.kind !== "end" && l) {
            const prev_p: Program = program;
            program = updateProgram(program, { label: l });
            session = updateSession(session, prev_p, l);
        }
    
        // continue with the next step
        if (session.kind !== "end") {
            await continueProgram(program, wss);
        }
        else {
            wss.emit('end');
        }
    
    });
    
    // "end" operation of the program and session
    wss.on('end', async () => {
    
        // try to update the session (if the program finished)
        if (session.kind !== "end") {
            session = updateSession(session, program);
        }
    
        // continue with the next step
        if (session.kind === "single") {
            await continueProgram(program, wss);
        }
        else if (session.kind === "choice") {
            if (program.command === "end") {
                // wait for a label to continue with the session
            }
            else {
                await continueProgram(program, wss);
            }
        }
        else {
            // close the connection
            client.close();
            wss.close();
        }
    });
    
    wss.on('close', () => {
        console.log("Connection closed");
    });

}

mk_server(process.argv);
