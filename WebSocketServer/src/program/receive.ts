import { Program, Session } from "../../protocol";

// "recv" operation of the program and session
export function receive (session: Session, program: Program, value: any): void {

    if (session.kind !== 'single' || program.command !== 'recv') { return; }

    program.put_value(value);
    
}