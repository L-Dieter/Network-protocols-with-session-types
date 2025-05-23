import { Session, Program } from "../../protocol";

// check if the session and the program fit together
export function checkSession (session: Session, program: Program): boolean {

    let valid_session: boolean = false;

    // skip def and ref
    if (session.kind === 'ref' || session.kind === 'def') { return true; }

    switch(program.command) {
        case "send": {
            if (session.kind === "single" && session.dir === "send") {

                valid_session = true;

                if (program.type) {
                    if (program.type.type !== session.payload.type) {

                        valid_session = false;
                    }
                }
            }
            else {
                valid_session = false;
            }
            break;
        }
        case "recv": {
            if (session.kind === "single" && session.dir === "recv") {

                valid_session = true;

                if (program.type) {
                    if (program.type.type !== session.payload.type) {
                        valid_session = false;
                    }
                }
            }
            else {
                valid_session = false;
            }
            break;
        }
        case "select": {
            if (session.kind === "choice" && session.dir === "send") {
                valid_session = true;
            }
            else {
                valid_session = false;
            }
            break;
        }
        case "choose": {
            if (session.kind === "choice" && session.dir === "recv") {
                valid_session = true;
            }
            else {
                valid_session = false;
            }
            break;
        }
        case "end": {
            if (session.kind === "end") {
                valid_session = true;
            }
            else {
                valid_session = false;
            }
            break;
        }
        default: valid_session = false;
    }

    return valid_session;

}
