import { WebSocketServer } from "ws";
import { Label, Program, Session } from "../../protocol";
import { send } from "./send";
import { end } from "./end";
import { select } from "./select";
import { request } from "../misc/request";

// check the program and do another step if possible
export function continueProgram (program: Program, session: Session, server?: WebSocketServer, client?: WebSocket, label?: Label): void {

    switch (program.command) {
        case "send": {
            if (client) {
                send(session, program, client);
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
            select(session, program);
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
                end(session, program, server, client);
            }
            break;
        }
        default: {
            server?.close();
        }
    }

}
