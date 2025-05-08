import { Type } from "../../protocol";
import { Marker } from "../interfaces/marker";

// check if the input and a payload type fit together
export function checkPayload (input: any, type: Type, markers?: Marker[]): boolean {

    let valid_payload: boolean = false;

    switch (type.type) {
        case "string": if (typeof input === "string") { valid_payload = true; } break;
        case "number": if (typeof input === "number") { valid_payload = true; } break;
        case "bool": if (typeof input === "boolean") { valid_payload = true; } break;
        case "any": valid_payload = true; break;
        case "null": if (input === null) { valid_payload = true; } break;
        case "union": {
            const union: Type[] = type.components;
            for (let i = 0; i < union.length; i++) {
                if (checkPayload(input, union[i])) {
                    valid_payload = true;
                    break;
                }
            }
            break;
        }
        case "record": {
            if (typeof input === "object" && !Array.isArray(input)) {
                const values_types: Type[] = Object.values(type.payload);
                const input_keys: string[] = Object.keys(input);
                const union: Type = { type: "union", components: values_types};
                for (let i = 0; i < input_keys.length; i++) {
                    if (!checkPayload(input[input_keys[i]], union)) {
                        valid_payload = false;
                        break;
                    }
                    else {
                        valid_payload = true;
                    }

                }
            }
            break;
        }
        case "tuple": {
            if (Array.isArray(input)) {
                for (let i = 0; i < type.payload.length; i++) {
                    valid_payload = checkPayload(input[i], type.payload[i]);
                    if (!valid_payload) {
                        break;
                    }
                }

            }
            break;
        }
        case "array": {
            if (Array.isArray(input)) {
                for (let i = 0; i < input.length; i++) {
                    valid_payload = checkPayload(input[i], type.payload);
                    if (!valid_payload) {
                        break;
                    }
                }
            }
            break;
        }
        case "ref": {
            if (!markers) { break; }

            // check if name exists (fail if it does not)
            for (const marker of markers) {
                if (type.name === marker.name) {
                    valid_payload = true;
                    break;
                }
            }
            break;
        }
        case "def": {
            if (!markers) { break; }

            valid_payload = true;

            // check if name exists (fail if it does)
            for (const marker of markers) {
                if (type.name === marker.name) {
                    valid_payload = false;
                    break;
                }
            }
            break;
        }
        default: valid_payload = false;

    }

    return valid_payload;
    
}