import { WebSocketServer } from "ws";
import { Program, Session } from "../../protocol";
import * as commands from "./commands";
import { request } from "../misc/request";

// check the program and do another step if possible
export function continueProgram (program: Program, session: Session, server?: WebSocketServer, client?: WebSocket): void {

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
            commands.select(session, program);
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
