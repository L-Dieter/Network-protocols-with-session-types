import { Session } from "../../protocol";
import { buildMsg } from "./buildMsg";

// send a request to the client
export function request (session: Session, client: WebSocket): void {

    if (session.kind === "single") {
        client.send(buildMsg("request", session.payload));
    }
    else if (session.kind === "choice") {
        client.send(buildMsg("request", { type: "string" }));
    }

}