import { Type } from "../../protocol"

// create a message for the client
export function buildMsg (name: string, type: Type, content?: any): string {
    return JSON.stringify({
        name: name,
        type: type,
        content: content
    })
}