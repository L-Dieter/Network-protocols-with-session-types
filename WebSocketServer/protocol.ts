/** concrete types for protocols */
/** payload types modeled after JSON */
export type Type =
    { type: "any" } |
    { type: "number" } |
    { type: "string" } |
    { type: "bool" } |
    { type: "null" } |
    { type: "union", components: Array<Type> } |
    { type: "record", payload: Record<string, Type>, name ?: string } | 
/** recursive type, back reference */
    { type: "ref", name: string } |
    { type: "def", name: string, payload: Type } |
/** tuples are JSON arrays of fixed length where each element may have a different type */
    { type: "tuple", payload: Array<Type> } |
/** arrays are JSON arrays of variable length where each element has the same type */
    { type: "array", payload: Type }

/** protocol types */
/** direction of transmission */
export type Dir = "send" | "recv"
/** label for protocol alternatives */
export type Label = string

/** construction of protocols */
export type Session =
    /** single shot: transfer payload and continue as cont */
  { kind: "single"; dir: Dir; payload: Type; cont: Session }
    /** choice: transfer tag and continue as alternatives[tag] */
| { kind: "choice"; dir: Dir; alternatives: Record<Label, Session> }
    /** set marker name and continue as cont */
| { kind: "def"; name: string; cont: Session }
    /** reference marker name; jump to its definition */
| { kind: "ref"; name: string }
    /** terminate protocol */
| { kind: "end" }

export type Program = 
      { command: "send",
        get_value: () => any,
        type ?: Type,
        cont: Program }
    | { command: "recv",
        put_value: (v: any) => void,
        type ?: Type,
        cont: Program }
    | { command: "select",
        get_value: () => Label,
        cont: Program }
    | { command: "choose",
        do_match: (label: Label) => void,
        alt_cont: Record<Label, Program> }
    | { command: "end" }
