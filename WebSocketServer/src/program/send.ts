import { Program, Session } from "../../protocol";
import { buildMsg } from "../misc/buildMsg";

// "send" operation of the program and session
export function send (session: Session, program: Program, client: WebSocket): void {

    if (session.kind !== 'single' || program.command !== 'send') { return; }

    const msg: string = buildMsg('message', session.payload, program.get_value());

    client.send(msg);

}