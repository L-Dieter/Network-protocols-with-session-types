import { Session } from "../../protocol";
import { Marker } from "../interfaces/marker";

// update the session
export function updateSession (session: Session, label?: string, marker?: Marker): Session {

    if (session.kind === "single") {
        session = session.cont;
    }
    else if (session.kind === "choice" && label) {
        session = session.alternatives[label];
    }
    // TODO: "ref" und "def"
    else if (session.kind === "def") {
        session = session.cont;
    }
    else if (session.kind === "ref" && marker) {
        session = marker.session;
    }

    return session;

}