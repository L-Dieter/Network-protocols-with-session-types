// Start a WebSocket server

import { WebSocketServer } from "ws";
import { Session, Program } from './protocol';
import { Marker } from "./src/interfaces/marker";
import { checkSession } from "./src/check/checkSession";
import { checkPayload } from "./src/check/checkPayload";
import * as commands from "./src/program/commands";
import { updateProgram } from "./src/update/updateProgram";
import { updateSession } from "./src/update/updateSession";
import { doSteps } from "./src/program/continueProgram";
import * as input from "./input";


// start the server with a given program and session
function mk_server (cmd_line: input.Config): void {

    let program: Program = input.getProgram(cmd_line);
    let session: Session = input.getSession(cmd_line);
    const port: number = input.getPort(cmd_line);

    let client: any;

    // a set of marker to store the references
    let markerDb: Marker[] = [];

    // loop over the programm and session to check if they fit together
    if (!checkSession(session, program, markerDb)) { return; }

    // start the server
    const wss = new WebSocketServer({port: port});
    console.log(`Listening at ${port}...`);


    wss.on('connection', async (ws) => {

        client = ws;

        // do the steps and update the session, program and markerDb
        const state: [Session, Program, Marker[]] = doSteps(session, program, wss, client, markerDb);
        session = state[0];
        program = state[1];
        markerDb = state[2];
        

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

            // if the payload check is successful continue, otherwise close the connection
            if (check) {

                if (program.command === "choose") {
                    commands.choose(session, program, msg);
                    session = updateSession(session, msg);
                    program = updateProgram(program, msg);
                }
                else if (program.command === "recv") {
                    commands.receive(session, program, msg);
                    session = updateSession(session);
                    program = updateProgram(program);
                }
            }
            else {
                ws.close();
                wss.close();
            }

            // get into the program and move on with the steps it can do
            // and update the session, program and markerDb
            const state: [Session, Program, Marker[]] = doSteps(session, program, wss, client, markerDb);
            session = state[0];
            program = state[1];
            markerDb = state[2];

        });


        ws.on('close', () => {
            // console.log('Client disconnected');
        });

    
    });


    wss.on('close', () => {
        console.log("Connection closed");
    });

}

// get the session, program and port out of a file if the name is given
async function getConfig (file?: string, name?: string): Promise<void> {

    if (file && name) {
        const file_name: string = file;
        const string_name: string = name;

        const mod: input.Config = (await import(file_name))[string_name] as input.Config;
    
        mk_server(mod);
    }
    else {
        mk_server(input.mkConfig());
    }

}

getConfig(process.argv[2], process.argv[3]);
