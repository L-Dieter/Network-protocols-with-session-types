import { Type } from "../../protocol";

// check if the input and a payload type fit together
export function checkPayload (input: any, type: Type, markers: { "name": string, "type": Type}[] = []): boolean {

    let valid_payload: boolean = false;
    let markerDB: { "name": string, "type": Type}[] = markers;

    switch (type.type) {
        case "string": if (typeof input === "string") { valid_payload = true; } break;
        case "number": if (typeof input === "number") { valid_payload = true; } break;
        case "bool": if (typeof input === "boolean") { valid_payload = true; } break;
        case "any": valid_payload = true; break;
        case "null": if (input === null) { valid_payload = true; } break;
        case "union": {
            const union: Type[] = type.components;
            for (let i = 0; i < union.length; i++) {
                if (checkPayload(input, union[i]), markerDB) {
                    valid_payload = true;
                    break;
                }
            }
            break;
        }
        case "record": {
            if (typeof input === "object" && !Array.isArray(input)) {

                Object.keys(type.payload).forEach(key => {

                    if (input[key] === undefined) {
                        valid_payload = false;
                        return;
                    }

                    if (!checkPayload(input[key], type.payload[key], markerDB)) {
                        valid_payload = false;
                        return;
                    }
                    else {
                        valid_payload = true;
                    }
                });
            }
            break;
        }
        case "tuple": {
            if (Array.isArray(input)) {
                for (let i = 0; i < type.payload.length; i++) {
                    valid_payload = checkPayload(input[i], type.payload[i], markerDB);
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
                    valid_payload = checkPayload(input[i], type.payload, markerDB);
                    if (!valid_payload) {
                        break;
                    }
                }
            }
            break;
        }
        case "ref": {

            // check if name exists (fail if it does not)
            for (const marker of markerDB) {
                if (type.name === marker.name) {
                    valid_payload = checkPayload(input, marker.type);
                    break;
                }
            }
            break;
        }
        case "def": {

            // check if the name exists already
            for (let marker of markerDB) {
                if (marker.name === type.name) {
                    return false;
                }
            }

            // safe the "name -> type" of the def
            markerDB.push({ "name": type.name, "type": type.payload});

            valid_payload = checkPayload(input, type.payload, markerDB);

            break;
        }
        default: valid_payload = false;

    }

    return valid_payload;
    
}
