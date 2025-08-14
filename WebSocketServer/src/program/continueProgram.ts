import { WebSocketServer } from "ws";
import { Program, Session } from "../../protocol";
import * as commands from "./commands";
import { request } from "../misc/request";
import { Marker } from "../interfaces/marker";
import { getMarker } from "../reference/getMarker";
import { setMarker } from "../reference/setMarker";
import { updateProgram } from "../update/updateProgram";
import { updateSession } from "../update/updateSession";

// check the program and do another step if possible
export function continueProgram (program: Program, session: Session, client: WebSocket, server?: WebSocketServer): void {

    switch (program.command) {
        case "send": {
            if (client) {
                commands.send(session, program, client);
            }
            break;
        }
        case "recv": {
            if (client) {
                request(session, client);
            }
            break;
        }
        case "select": {
            commands.select(session, program, client);
            break;
        }
        case "choose": {
            if (client) {
                request(session, client);
            }
            break;
        }
        case "end": {
            if (server && client) {
                commands.end(session, program, server, client);
            }
            break;
        }
        default: {
            server?.close();
        }
    }

}

// loop for 'continueProgram'
export function doSteps(session: Session, program: Program, wss: WebSocketServer, client: WebSocket, markerDb: Marker[]): [Session, Program, Marker[]] {
    
    // do some steps that does not require an input or terminate the session
    // cases: single send, choice send, def, ref
    while (program.command === "send" || program.command === "select" || session.kind === "def" || session.kind === "ref") {
        switch (session.kind) {
            case "single": {
                continueProgram(program, session, client, wss);
                session = updateSession(session);
                program = updateProgram(program);
                break;
            }
            case "choice": {
                if (program.command === "select") {
                    continueProgram(program, session, client, wss);
                    session = updateSession(session, program.get_value());
                    program = updateProgram(program);
                }
                else {
                    // send request
                    continueProgram(program, session, client, wss);
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
                continueProgram(program, session, client, wss);
                break;
            }
        }
    }

    // do the next step that either requires an input or terminates the session
    // cases: single recv, choice recv, end
    continueProgram(program, session, client, wss);

    return [session, program, markerDb];
}
