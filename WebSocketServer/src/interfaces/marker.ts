import { Program, Session } from "../../protocol";

export interface Marker {
    name: string,
    program: Program,
    session: Session
}