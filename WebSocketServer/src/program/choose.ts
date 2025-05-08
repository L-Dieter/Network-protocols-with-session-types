import { Program, Label, Session } from "../../protocol";

// "choose" operation of the program
export function choose (session: Session, program: Program, label: Label): void {

    if (session.kind !== 'choice' || program.command !== 'choose') { return; }
    
    program.do_match(label);

}