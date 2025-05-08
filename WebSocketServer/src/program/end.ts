import { WebSocketServer } from "ws";
import { Program, Session } from "../../protocol";

// "end" operation of the program and session
export function end (session: Session, program: Program, server: WebSocketServer, client: WebSocket): void {

    if (session.kind !== 'end' || program.command !== 'end') { return; }

    client.close();
    server.close();

}