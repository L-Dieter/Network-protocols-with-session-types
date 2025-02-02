export type Type = 
      { type: "any" }
    | { type: "number" }
    | { type: "string" }
    | { type: "boolean" }
    | { type: "null" }
    | { type: "union", components: Array<Type> }
    | { type: "record", payload: Record<string, Type>, name?: string }
    // array of fixed length where each element may have a different type
    | { type: "tuple", payload: Array<Type> }
    // array of variable length where each element has the same type
    | { type: "array", payload: Type }

export type Dir = "send" | "recv"

export type Label = string

export type Session = 
        // single operation 
      { kind: "single"; dir: Dir; payload: Type; program: Program; cont: Session }
        // choice operator
    | { kind: "choice"; dir: Dir; program: Program; alternatives: Record<Label, Session> }
        // terminate protocol
    | { kind: "end" }

export type Program = 
      { command: "send",
        get_value: () => any,
        cont: Program }
    | { command: "recv",
        put_value: (v: any) => void,
        cont: Program }
    | { command: "select",
        get_value: () => string,
        cont: Program }
    | { command: "choose",
        do_match: (label: Label) => void,
        alt_cont: Record<Label, Program> }
    | { command: "end" }
