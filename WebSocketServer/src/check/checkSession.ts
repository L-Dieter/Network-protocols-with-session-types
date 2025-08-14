import { Session, Program, Label } from "../../protocol";
import { Marker } from "../interfaces/marker";
import { getMarker } from "../reference/getMarker";
import { setMarker } from "../reference/setMarker";
import { updateProgram } from "../update/updateProgram";
import { updateSession } from "../update/updateSession";

// check if the session and the program fit together
export function checkSession (session: Session, program: Program, markerDB: Marker[], loop: string[] = []): boolean {

    let valid_session: boolean = false;

    // 'def' is valid at any time
    if (session.kind === "def") {
        const name: string = session.name;
        // check if the name exists already
        for (let marker of markerDB) {
            if (marker.name === name) {
                return false;
            }
        }

        markerDB = setMarker(name, markerDB, program, session.cont);

        session = updateSession(session);
        valid_session = checkSession(session, program, markerDB, loop);
    }

    // check if the 'ref' is used inside a 'def' of the same name, otherwise fail
    if (session.kind === "ref") {
        const name: string = session.name;
        for (let marker of markerDB) {
            if (marker.name === name) {

                const mark: Marker = getMarker(name, markerDB);
                
                // check for a loop to prevent an infinite test
                if (loop.includes(mark.name)) {
                    return true;
                }
                else {
                    loop.push(mark.name);
                    program = mark.program;
                    session = mark.session;
                    valid_session = checkSession(session, program, markerDB, loop);
                    return valid_session;
                }

            }

        }

        valid_session = false;

    }

    // check if the session fits the program
    switch(program.command) {
        case "send": {
            if (session.kind === "single" && session.dir === "send") {

                // if a type is given by the program, check if it fits the one of the session
                if (program.type) {
                    if (program.type.type !== session.payload.type) {
                        return false;
                    }
                }

                valid_session = checkNext(session, program, markerDB, loop);

            }
            else {
                valid_session = false;
            }

            break;
        }
        case "recv": {
            if (session.kind === "single" && session.dir === "recv") {

                // if a type is given by the program, check if it fits the one of the session
                if (program.type) {
                    if (program.type.type !== session.payload.type) {
                        return false;
                    }
                }

                valid_session = checkNext(session, program, markerDB, loop);
            }
            else {
                valid_session = false;
            }

            break;
        }
        case "select": {
            if (session.kind === "choice" && session.dir === "send") {

                for (const label in session.alternatives) {
                    // check if the label in 'alternatives' matches the selected one
                    if (label === program.get_value()) {
                        valid_session = checkNext(session, program, markerDB, loop, label);
                        break;
                    }
                    else {
                        valid_session = checkNext(session, program, markerDB, loop, label);
                    }
                }

            }
            else {
                valid_session = false;
            }
            break;
        }
        case "choose": {
            if (session.kind === "choice" && session.dir === "recv") {

                // check if a label of the session matches one of the program
                for (const label in session.alternatives) {
                    valid_session = checkNext(session, program, markerDB, loop, label);

                    // if one path (that is not part of def/ref) is correct stop searching
                    if (valid_session && !loop) {
                        break;
                    }
                }

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

// update the session and program and continue with the next step
function checkNext (session: Session, program: Program, markerDB: Marker[], loop: string[], label?: Label,): boolean {

    session = updateSession(session, label);
    program = updateProgram(program, label);
    return checkSession(session, program, markerDB, loop);

}
