import { Program, Session } from "../../protocol";
import { Marker } from "../interfaces/marker";

// set a new marker
export function setMarker (name: string, marker: Marker[], prog: Program, ses: Session): Marker[] {

    const targetMarker: Marker | undefined = marker.find((m: Marker) => m.name === name);

    if (!targetMarker) {
        const new_marker: Marker = {
            name: name,
            program: prog,
            session: ses
        };
        marker.push(new_marker);
    }
    
    return marker;

}
