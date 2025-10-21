import { Config } from "../../input";
import { Session, Program } from "../../protocol";


// session for a simple calculator
const calcSession: Session = {
    kind: "single",
    dir: "send",
    payload: { type: "string" },
    cont: {
        kind: "def",
        name: "calculator",
        cont: {
            kind: "choice",
            dir: "recv",
            alternatives: {
                add: {
                    kind: "single",
                    dir: "recv",
                    payload: { type: "number" },
                    cont: {
                        kind: "single",
                        dir: "send",
                        payload: { type: "number" },
                        cont: {
                            kind: "ref",
                            name: "calculator"
                        }
                    }
                },
                sub: {
                    kind: "single",
                    dir: "recv",
                    payload: { type: "number" },
                    cont: {
                        kind: "single",
                        dir: "send",
                        payload: { type: "number" },
                        cont: {
                            kind: "ref",
                            name: "calculator"
                        }
                    }
                },
                mult: {
                    kind: "single",
                    dir: "recv",
                    payload: { type: "number" },
                    cont: {
                        kind: "single",
                        dir: "send",
                        payload: { type: "number" },
                        cont: {
                            kind: "ref",
                            name: "calculator"
                        }
                    }
                },
                div: {
                    kind: "single",
                    dir: "recv",
                    payload: { type: "number" },
                    cont: {
                        kind: "single",
                        dir: "send",
                        payload: { type: "number" },
                        cont: {
                            kind: "ref",
                            name: "calculator"
                        }
                    }
                },
                reset: {
                    kind: "single",
                    dir: "send",
                    payload: { type: "number" },
                    cont: {
                        kind: "ref",
                        name: "calculator"
                    }
                },
                result: {
                    kind: "single",
                    dir: "send",
                    payload: { type: "number" },
                    cont: {
                        kind: "end"
                    }
                }
            }
        }
    }
}

// program for a simple calculator
function mkCalculator (): Program {
    var x: number = 0;
    return {
        command: "send",
        type: { type: "string" },
        get_value: () => "This is a simple calculator!\n The first number is 0.",
        cont: {
            command: "choose",
            do_match: (l) => l,
            alt_cont: {
                add: {
                    command: "recv",
                    type: { type: "number" },
                    put_value: (a) => x += a,
                    cont: {
                        command: "send",
                        get_value: () => x,
                        cont: {
                            command: "end"
                        }
                    }
                },
                sub: {
                    command: "recv",
                    type: { type: "number" },
                    put_value: (a) => x -= a,
                    cont: {
                        command: "send",
                        get_value: () => x,
                        cont: {
                            command: "end"
                        }
                    }
                },
                mult: {
                    command: "recv",
                    type: { type: "number" },
                    put_value: (a) => x *= a,
                    cont: {
                        command: "send",
                        get_value: () => x,
                        cont: {
                            command: "end"
                        }
                    }
                },
                div: {
                    command: "recv",
                    type: { type: "number" },
                    put_value: (a) => x /= a,
                    cont: {
                        command: "send",
                        get_value: () => x,
                        cont: {
                            command: "end"
                        }
                    }
                },
                reset: {
                    command: "send",
                    type: { type: "number" },
                    get_value: () => { return x = 0 },
                    cont: {
                        command: "end"
                    }
                },
                result: {
                    command: "send",
                    type: { type: "number" },
                    get_value: () => x,
                    cont: {
                        command: "end"
                    }
                }
            }
        }
    }
}

export const demo1: Config = {
    session: calcSession,
    program: mkCalculator(),
    port: 3000
}
