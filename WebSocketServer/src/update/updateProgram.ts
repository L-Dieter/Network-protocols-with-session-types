import { Program } from "../../protocol";
import { Marker } from "../interfaces/marker";

// update the program
export function updateProgram (program: Program, label?: string, marker?: Marker): Program {

    if (program.command !== "end" && program.command !== "choose") {
        program = program.cont;
    }
    else if (program.command === "choose" && label) {
        program = program.alt_cont[label];
    }
    else if (marker) {
        program = marker.program;
    }

    return program;

}