import { Program, Label, Session } from "../../protocol";
import { WebSocketServer } from "ws";
import { buildMsg } from "../misc/buildMsg";

// "choose" operation of the program
export function choose (session: Session, program: Program, label: Label): void {

    if (session.kind !== 'choice' || program.command !== 'choose') { return; }
    
    program.do_match(label);

}

// "end" operation of the program and session
export function end (session: Session, program: Program, server: WebSocketServer, client: WebSocket): void {

    if (session.kind !== 'end' || program.command !== 'end') { return; }

    client.close();
    server.close();

}

// "recv" operation of the program and session
export function receive (session: Session, program: Program, value: any): void {

    if (session.kind !== 'single' || program.command !== 'recv') { return; }

    program.put_value(value);
    
}

// "select" operation of the program
export function select (session: Session, program: Program, client: WebSocket): void {

    if (session.kind !== 'choice' || program.command !== 'select') { return; }

    const label: Label = program.get_value();
    const msg: string = buildMsg('message', { type: "string" }, `<Label: ${label}>`);

    client.send(msg);

}

// "send" operation of the program and session
export function send (session: Session, program: Program, client: WebSocket): void {

    if (session.kind !== 'single' || program.command !== 'send') { return; }

    const msg: string = buildMsg('message', session.payload, program.get_value());

    client.send(msg);

}
