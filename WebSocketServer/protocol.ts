export type Type = 
    | { type: "number" } 
    | { type: "string" }
    | { type: "null" }
    | { type: "tuple"; payload: Array<Type> }
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
