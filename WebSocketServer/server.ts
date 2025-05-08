// Start a WebSocket server

import { WebSocketServer } from "ws";
import { Type, Dir, Label, Session, Program } from './protocol';
import { Marker } from "./src/interfaces/marker";
import { getMarker } from "./src/reference/getMarker";
import { setMarker } from "./src/reference/setMarker";
import { checkSession } from "./src/check/checkSession";
import { checkPayload } from "./src/check/checkPayload";
import { choose } from "./src/program/choose";
import { receive } from "./src/program/receive";
import { updateProgram } from "./src/update/updateProgram";
import { updateSession } from "./src/update/updateSession";
import { continueProgram } from "./src/program/continueProgram";
import { commandLine } from "./input";

// start the server with a given program and session
function mk_server (cmd_line: any[] = commandLine, port: number = commandLine[3]): void {

    const wss = new WebSocketServer({port: port});

    // let program: Program = JSON.parse(cmd_line[2]);
    // let session: Session = JSON.parse(cmd_line[3]);
    let program: Program = cmd_line[2];
    let session: Session = cmd_line[3];

    let client: any;

    // a set of marker to store the references
    let markerDb: Marker[] = [];

    // session and program for the loop
    let sessionToCheck: Session = session;
    let programToCheck: Program = program;

    // track the session to go back if needed
    let markPosition: [Session, Program, Label][] = [];
    let failedLabels: Label[] = [];


    // loop over the programm and session to check if they fit together
    while (programToCheck.command !== "end" || sessionToCheck.kind !== "end") {

        if (!checkSession(sessionToCheck, programToCheck)) {
            // jump to the last valid position
            if (markPosition.length !== 0) {
                sessionToCheck = markPosition[markPosition.length - 1][0];
                programToCheck = markPosition[markPosition.length - 1][1];
                failedLabels.push(markPosition[markPosition.length - 1][2]);
                markPosition.pop();
            }
            else {
                wss.close();
                break;
            }
        }

        if (sessionToCheck.kind === "single") {
            sessionToCheck = updateSession(sessionToCheck);
            programToCheck = updateProgram(programToCheck);
        }
        else if (sessionToCheck.kind === "choice") {

            if (programToCheck.command === "choose") {

                let label: Label = "";

                for (const key in sessionToCheck.alternatives) {
                    if (key in programToCheck.alt_cont && !(failedLabels.includes(key))) {
                        label = key;
                        markPosition.push([sessionToCheck, programToCheck, label]);
                        break;
                    }
                }

                if (!label) {
                    wss.close();
                    break;
                }

                sessionToCheck = updateSession(sessionToCheck, label);
                programToCheck = updateProgram(programToCheck, label);
            }
            else if (programToCheck.command === "select") {
                sessionToCheck = updateSession(sessionToCheck, programToCheck.get_value());
                programToCheck = updateProgram(programToCheck);
            }
        }
        else if (session.kind === "ref") {
            const marker: Marker = getMarker(session.name, markerDb);
            programToCheck = marker.program;
            sessionToCheck = marker.session;
        }
        else if (session.kind === "def") {
            markerDb = setMarker(session.name, markerDb, program, session.cont);
            session = session.cont;
            break;
        }

    }

    markerDb = [];

    console.log(`Listening at ${port}...`);


    wss.on('connection', async (ws) => {

        client = ws;

        // do some steps that does not require an input or terminate the session
        while (program.command === "send" || program.command === "select") {
            switch (session.kind) {
                case "single": {
                    continueProgram(program, session, wss, client);
                    session = updateSession(session);
                    program = updateProgram(program);
                    break;
                }
                case "choice": {
                    if (program.command === "select") {
                        continueProgram(program, session, wss, client);
                        session = updateSession(session, program.get_value());
                        program = updateProgram(program);
                    }
                    else {
                        // send request
                        continueProgram(program, session, wss, client);
                    }
                    break;
                }
                case "def": {
                    markerDb = setMarker(session.name, markerDb, program, session.cont);
                    session = session.cont;
                    break;
                }
                case "ref": {
                    const marker: Marker = getMarker(session.name, markerDb);
                    program = marker.program;
                    session = marker.session;
                    break;
                }
                case "end": {
                    continueProgram(program, session, wss, client);
                    break;
                }
            }
        }

        continueProgram(program, session, wss, client);
        

        // incoming message of any type
        ws.on('message', (message: any) => {

            let msg: any = JSON.parse(message);

            let check: boolean = true;

            // check payload if possible
            if (session.kind === "single") {
                if (!checkPayload(msg, session.payload)) {
                    check = false;
                }
            }
            // msg has to be a string if it is a "choice" session
            else if (session.kind === "choice") {
                if (!checkPayload(msg, { type: "string" })) {
                    check = false;
                }
                else {
                    // the msg has to be the same as an existing label in session.alternatives
                    for (const key of Object.keys(session.alternatives)) {
                        if (msg === key) {
                            check = true;
                            break;
                        }
                        else {
                            check = false;
                        }
                    }
                }

            }
            // check if the given name exists to reference it
            else if (session.kind === "ref") {
                if (!checkPayload(msg, { type: "ref", name: session.name }, markerDb)) {
                    check = false;
                }
            }
            // check if the given name exists for another definition
            else if (session.kind === "def") {
                if (!checkPayload(msg, { type: "def", name: session.name, payload: { type: "any" } }, markerDb)) { // TODO: not sure what the payload should be
                    check = false;
                }
            }

            // if the payload check is successful continue, otherwise close the connection
            if (check) {
                // use the message to continue with the program and session
                if (program.command === "choose") {
                    choose(session, program, msg);
                    session = updateSession(session, msg);
                    program = updateProgram(program, msg);
                }
                else if (program.command === "recv") {
                    receive(session, program, msg);
                    session = updateSession(session);
                    program = updateProgram(program);
                }
            }
            else {
                ws.close();
                wss.close();
            }

            // get into the program and move on with the steps it can do
            while (program.command === "select" || program.command === "send") {
                switch (session.kind) {
                    case "single": {
                        continueProgram(program, session, wss, client);
                        session = updateSession(session);
                        program = updateProgram(program);
                        break;
                    }
                    case "choice": {
                        if (program.command === "select") {
                            continueProgram(program, session, wss, client);
                            session = updateSession(session, program.get_value());
                            program = updateProgram(program);
                        }
                        else {
                            // send request
                            continueProgram(program, session, wss, client);
                        }
                        break;
                    }
                    case "def": {
                        markerDb = setMarker(session.name, markerDb, program, session.cont);
                        session = session.cont;
                        break;
                    }
                    case "ref": {
                        const marker: Marker = getMarker(session.name, markerDb);
                        program = marker.program;
                        session = marker.session;
                        break;
                    }
                    case "end": {
                        continueProgram(program, session, wss, client);
                        break;
                    }
                }
            }

            continueProgram(program, session, wss, client);

        });

            
        ws.on('close', () => {
            // console.log('Client disconnected');
        });

    
    });

    
    wss.on('close', () => {
        console.log("Connection closed");
    });

}

mk_server();
