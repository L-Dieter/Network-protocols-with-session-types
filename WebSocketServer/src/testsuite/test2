
import { Config } from "../../input";
import { Label, Program, Session } from "../../protocol";

// test all kinds of sessions

const testSessions: Session = {
    // choice send
    kind: "choice",
    dir: "send",
    alternatives: {
        "end": { kind: "end" },
        "start_loop_test": {
            // single recv
            kind: "single",
            dir: "recv",
            payload: { type: "any" },
            cont: {
                // single send
                kind: "single",
                dir: "send",
                payload: { type: "any" },
                cont: {
                    // choice recv
                    kind: "choice",
                    dir: "recv",
                    alternatives: {
                        "end": { kind: "end" },
                        "continue": {
                            // choice send
                            kind: "choice",
                            dir: "send",
                            alternatives: {
                                "end": { kind: "end" },
                                "continue": {
                                    // def
                                    kind: "def",
                                    name: "Test",
                                    cont: {
                                        kind: "choice",
                                        dir: "recv",
                                        alternatives: {
                                            "end": { kind: "end" },
                                            "continue": {
                                                kind: "single",
                                                dir: "send",
                                                payload: { type: "string" },
                                                cont: {
                                                    // ref
                                                    kind: "ref",
                                                    name: "Test"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } 
}

function mkTestProgram (): Program {
    var x: any, y: string, l: Label, list: Label[] = ["next", "end", "start_loop_test"];
    y = "loop";
    return {
        command: "select",
        get_value: () => list[2],
        cont: {
            command: "recv",
            put_value: (v) => x = v,
            cont: {
                command: "send",
                get_value: () => x,
                cont: {
                    command: "choose",
                    do_match: (label) => l = label,
                    alt_cont: {
                        "end": { command: "end" },
                        "continue": {
                            command: "select",
                            get_value: () => l,
                            cont: {
                                command: "choose",
                                do_match: (label) => l = label,
                                alt_cont: {
                                    "end": { command: "end" },
                                    "continue": {
                                        command: "send",
                                        get_value: () => y,
                                        cont: { command: "end" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } 
}

export const test2: Config = {
    session: testSessions,
    program: mkTestProgram(),
    port: 3000
}
