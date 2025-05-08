import { Program, Session } from "../../protocol";

// "select" operation of the program
export function select (session: Session, program: Program): void {

    if (session.kind !== 'choice' || program.command !== 'select') { return; }

    program.get_value();

}