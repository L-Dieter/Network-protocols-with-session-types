import { Marker } from "../interfaces/marker";

// get marker name
export function getMarker (name: string, marker: Marker[]): Marker {

    const targetMarker: any = marker.find((m: Marker) => m.name === name);

    return targetMarker;

}