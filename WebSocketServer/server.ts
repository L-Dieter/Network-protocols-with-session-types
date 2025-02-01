// Start a WebSocket server

import { WebSocketServer } from "ws";
import { Type, Dir, Label, Session, Program } from './protocol';
import * as programs from './programs';


const port = 3000;
const wss = new WebSocketServer({port});



// update the session
const updateSession = (ses: Session, label?: string): Promise<Session> => {

    if (ses.kind === "single") {
        if (ses.program.command === "recv") {
            ses.dir = "recv";
        }
        else if (ses.program.command === "send") {
            ses.dir = "send";
        }
        if (ses.program.command === "end") {
            ses = ses.cont;
        }
    }
    else if (ses.kind === "choice") {
        if (ses.program.command === "recv") {
            ses.dir = "recv";
        }
        else if (ses.program.command === "send") {
            ses.dir = "send";
        }
        if (ses.program.command === "end" && label) {
            ses = ses.alternatives[label];
        }
    }
    else {
        return Promise.reject("Failed to update the session");
    }

    return Promise.resolve(ses);

}

// update the program
const updateProgram = (p: Program, s: Session, val?: { value?: any, label?: string }): Promise<void> => {

    let return_value: any;
    let updated: boolean = false;

    if (p.command !== "end" && p.command !== "choose") {
        if (p.command === "recv" && val) {
            p.put_value(val.value);
            updated = true;
        }
        else if (p.command === "send") {
            return_value = p.get_value();
        }
        else if (p.command === "select") {
            return_value = p.get_value();
        }
        p = p.cont;
    }
    else if (p.command === "choose" && val && val.label) {
        p.do_match(val.label);
        p = p.alt_cont[val.label];
        updated = true;
    }

    if (s.kind !== "end") {
        s.program = p;
    }

    if (return_value) {
        return Promise.resolve(return_value);
    }
    else if (updated) {
        return Promise.resolve();
    }
    else {
        return Promise.reject('Failed to update the program');
    }

}

// initialize a session based on the input string
const initSession = (kind: string): Promise<Session> => {
    if (kind === "single") {

        return Promise.resolve({ kind: kind, dir: "recv", payload: { type: "null" } ,
                program: { command: "end"}, cont: { kind: "end"} });
    }
    else if (kind === "choice") {

        return Promise.resolve({ kind: kind, dir: "recv", program: { command: "end"},
                alternatives:  { end: { kind: "end" } } });
    }
    return Promise.reject('No session of that kind available');
}

// fill the Session with the given arguments
const fillSession = (ses: Session, val?: { payload?: any, program?: Program }): Promise<void> => {
    if (ses.kind !== "end" && val) {
        if (val.payload && ses.kind === "single") {
            ses.payload = val.payload;
        }

        if (val.program) {
            ses.program = val.program;
        }
    }

    return Promise.resolve();
}

// get a program out of a list based on a input string
const getProgram = (p: string): Promise<Program> => {

    const lower_prog: string = p.toLowerCase();
    let prog: Program;

    switch (lower_prog) {
        case "mk_adder": {
            prog = programs.mk_adder();
            fillSession(session, { payload: { type: "number"} });
            break;
        }
        case "mk_neg": {
            prog = programs.mk_neg();
            fillSession(session, { payload: { type: "number"} });
            break;
        }
        case "mk_arith": {
            prog = programs.mk_arith();
            fillSession(session, { payload: { type: "string"} });
            break;
        }
        case "mk_jsonadd": {
            prog = programs.mk_jsonAdd();
            fillSession(session, { payload: { type: "tuple"} });
            break;
        }
        case "mk_stringneg": {
            prog = programs.mk_stringNeg();
            fillSession(session, { payload: { type: "string"} });
            break;
        }
        default: {
            return Promise.reject('Not a valid program');
        }
    }

    return Promise.resolve(prog);
}

// check if the session and the program fit together
const checkSession = (s: Session, p: Program): Promise<void> => {

    var valid_session: boolean = false;
    
    if (s.kind !== "end") {
        if (p.command) {
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

const continueProgram = (p: Program, label?: Label): Promise<void> => {

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





let program: Program;
let session: Session;
let client: any;

// start the server with a given program and session
const mk_server = async (p: string | Program, s: string | Session): Promise<void> => {

    try {

        if (typeof s === "string") {
            session = await initSession(s);
        }
        else {
            session = s;
        }

        if (typeof p === "string") {
            program = await getProgram(p);
        }
        else {
            program = p;
        }

        await checkSession(session, program);

        fillSession(session, { program: program} );

        console.log(`Listening at ${port}...`);

    }
    catch (error) {
        
        console.error(error);

        wss.close();

    }

    await updateSession(session);

    wss.on('connection', async (ws) => {

        client = ws;

        if (program.command !== "recv" && program.command !== "choose") {
            await continueProgram(program);
        }

        // incoming message of any type
        ws.on('message', async (message: any) => {

            let msg: any = JSON.parse(message);


            if (session.kind !== "end") {
                if (session.dir !== "recv" && session.program.command !== "end") {
                    await continueProgram(session.program);
                }
                else if (session.program.command === "choose") {
                    wss.emit('choose', msg);
                }
                else if (session.program.command === "recv") {
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

    
}

// "recv" operation of the program
wss.on('recv', async (msg: any) => {

    if (session.kind !== "end") {
        if (session.program.command === "recv") {
            session.program.put_value(msg);
            await updateProgram(session.program, session, { value: msg });
            session = await updateSession(session);
        }
        else if (session.kind === "choice") {
            session = await updateSession(session, msg);
        }
    }

    // continue with the next step
    if (session.kind !== "end") {
        await continueProgram(session.program);
    }
    else {
        wss.emit('end');
    }
});

// "send" operation of the program and session
wss.on('send', async () => {

    // get the operation done
    if (session.kind !== "end") {
        if (session.program.command === "send") {
            client.send(JSON.stringify(session.program.get_value()));
        }
        await updateProgram(session.program, session);
        session = await updateSession(session);
    }

    // continue with the next step
    if (session.kind !== "end") {
        await continueProgram(session.program);
    }
    else {
        wss.emit('end');
    }
});

// "select" operation of the program
wss.on('select', async () => {

    if (session.kind !== "end") {
        if (session.program.command === "select" && session.program.cont.command === "choose") {
            const select: string = session.program.get_value();
            await updateProgram(session.program, session);
            await continueProgram(session.program, select);
        }
        else if (session.kind === "choice") {
            if (session.program.command === "select" && session.program.cont.command === "end") {
                session = await updateSession(session, session.program.get_value());
            }
        }
        else {
            await updateProgram(session.program, session);
            await continueProgram(session.program);
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
        await updateProgram(session.program, session, { label: l });
        session = await updateSession(session);
    }

    // continue with the next step
    if (session.kind !== "end") {
        await continueProgram(session.program);
    }
    else {
        wss.emit('end');
    }

});

// "end" operation of the program and session
wss.on('end', async () => {

    // try to update the session (if the program finished)
    if (session.kind !== "end") {
        session = await updateSession(session);
    }

    // continue with the next step
    if (session.kind === "single") {
        await continueProgram(session.program);
    }
    else if (session.kind === "choice") {
        // TODO?
        // wait for a label to continue with the next session
        // client.send(JSON.stringify("--- Label required ---"));
        // client.close();
        // wss.close();
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


const mk_program: string | Program = process.argv[2];
const mk_session: string | Session = process.argv[3];

mk_server(mk_program, mk_session);
