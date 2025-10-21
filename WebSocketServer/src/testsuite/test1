import { Config } from "../../input";
import { Session, Program } from "../../protocol";


// receive an input of the given kind and send it back to the client

// session
const testTypesSession: Session = {
    // any
    kind: "single",
    dir: "recv",
    payload: { type: "any" },
    cont: {
        kind: "single",
        dir: "send",
        payload: { type: "any" },
        cont: {
            // number
            kind: "single",
            dir: "recv",
            payload: { type: "number" },
            cont: {
                kind: "single",
                dir: "send",
                payload: { type: "number" },
                cont: {
                    // string
                    kind: "single",
                    dir: "recv",
                    payload: { type: "string" },
                    cont: {
                        kind: "single",
                        dir: "send",
                        payload: { type: "string" },
                        cont: {
                            // bool
                            kind: "single",
                            dir: "recv",
                            payload: { type: "bool" },
                            cont: {
                                kind: "single",
                                dir: "send",
                                payload: { type: "bool" },
                                cont: {
                                    // null
                                    kind: "single",
                                    dir: "recv",
                                    payload: { type: "null" },
                                    cont: {
                                        kind: "single",
                                        dir: "send",
                                        payload: { type: "null" },
                                        cont: {
                                            // union
                                            kind: "single",
                                            dir: "recv",
                                            payload: { type: "union", components: [{ type: "number" }, { type: "string" }, { type: "bool" }] },
                                            cont: {
                                                kind: "single",
                                                dir: "send",
                                                payload: { type: "union", components: [{ type: "number" }, { type: "string" }, { type: "bool" }] },
                                                cont: {
                                                    // record
                                                    kind: "single",
                                                    dir: "recv",
                                                    payload: { type: "record", payload: { animal: { type: "string" }, age: { type: "number" }, owner: { type: "bool" } }, name: "Dog" },
                                                    cont: {
                                                        kind: "single",
                                                        dir: "send",
                                                        payload: { type: "record", payload: { animal: { type: "string" }, age: { type: "number" }, owner: { type: "bool" } }, name: "Dog" },
                                                        cont: {
                                                            // tuple
                                                            kind: "single",
                                                            dir: "recv",
                                                            payload: { type: "tuple", payload: [{ type: "number" }, { type: "string" }, { type: "bool" }] },
                                                            cont: {
                                                                kind: "single",
                                                                dir: "send",
                                                                payload: { type: "tuple", payload: [{ type: "number" }, { type: "string" }, { type: "bool" }] },
                                                                cont: {
                                                                    // array
                                                                    kind: "single",
                                                                    dir: "recv",
                                                                    payload: { type: "array", payload: { type: "number" } },
                                                                    cont: {
                                                                        kind: "single",
                                                                        dir: "send",
                                                                        payload: { type: "array", payload: { type: "number" } },
                                                                        cont: {
                                                                            // def without ref
                                                                            kind: "single",
                                                                            dir: "recv",
                                                                            payload: { type: "def", name: "test1", payload: { type: "number" } },
                                                                            cont: {
                                                                                kind: "single",
                                                                                dir: "send",
                                                                                payload: { type: "def", name: "test1", payload: { type: "number" } },
                                                                                cont: {
                                                                                    // def with ref
                                                                                    kind: "single",
                                                                                    dir: "recv",
                                                                                    payload: {
                                                                                        type: "def", name: "test2", payload: {
                                                                                            type: "tuple", payload: [{ type: "string" }, { type: "union", components:
                                                                                                [{ type: "number" }, { type: "bool" }, { type: "ref", name: "test2" }]
                                                                                            }]
                                                                                        }
                                                                                    },
                                                                                    cont: {
                                                                                        kind: "single",
                                                                                        dir: "send",
                                                                                        payload: {
                                                                                            type: "def", name: "test2", payload: {
                                                                                                type: "tuple", payload: [{ type: "string" }, { type: "union", components:
                                                                                                    [{ type: "number" }, { type: "bool" }, { type: "ref", name: "test2" }]
                                                                                                }]
                                                                                            }
                                                                                        },
                                                                                        cont: {
                                                                                            // success
                                                                                            kind: "single",
                                                                                            dir: "send",
                                                                                            payload: { type: "string"},
                                                                                            cont: {
                                                                                                // end
                                                                                                kind: "end"
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


// program
function mkTestTypesProgram (): Program {
    var x: any;
    return {
        // any
        command: "recv",
        put_value: (v) => x = v,
        type: { type: "any" },
        cont: {
            command: "send",
            get_value: () => x,
            type: { type: "any" },
            cont: {
                // number (1)
                command: "recv",
                put_value: (v) => x = v,
                type: { type: "number" },
                cont: {
                    command: "send",
                    get_value: () => x,
                    type: { type: "number" },
                    cont: {
                        // string ("ok")
                        command: "recv",
                        put_value: (v) => x = v,
                        type: { type: "string" },
                        cont: {
                            command: "send",
                            get_value: () => x,
                            type: { type: "string" },
                            cont: {
                                // bool (true)
                                command: "recv",
                                put_value: (v) => x = v,
                                type: { type: "bool" },
                                cont: {
                                    command: "send",
                                    get_value: () => x,
                                    type: { type: "bool" },
                                    cont: {
                                        // null (null)
                                        command: "recv",
                                        put_value: (v) => x = v,
                                        type: { type: "null" },
                                        cont: {
                                            command: "send",
                                            get_value: () => x,
                                            type: { type: "null" },
                                            cont: {
                                                // union ("ok")
                                                command: "recv",
                                                put_value: (v) => x = v,
                                                cont: {
                                                    command: "send",
                                                    get_value: () => x,
                                                    cont: {
                                                        // record ({ "animal": "dog", "age": 5, "owner": false })
                                                        command: "recv",
                                                        put_value: (v) => x = v,
                                                        cont: {
                                                            command: "send",
                                                            get_value: () => x,
                                                            cont: {
                                                                // tuple ([1, "ok", true])
                                                                command: "recv",
                                                                put_value: (v) => x = v,
                                                                cont: {
                                                                    command: "send",
                                                                    get_value: () => x,
                                                                    cont: {
                                                                        // array ([1, 2, 3])
                                                                        command: "recv",
                                                                        put_value: (v) => x = v,
                                                                        cont: {
                                                                            command: "send",
                                                                            get_value: () => x,
                                                                            cont: {
                                                                                // def without ref (3)
                                                                                command: "recv",
                                                                                put_value: (v) => x = v,
                                                                                cont: {
                                                                                    command: "send",
                                                                                    get_value: () => x,
                                                                                    cont: {
                                                                                        // def with ref (["ok", ["true", true]])
                                                                                        command: "recv",
                                                                                        put_value: (v) => x = v,
                                                                                        cont: {
                                                                                            command: "send",
                                                                                            get_value: () => x,
                                                                                            cont: {
                                                                                                command: "send",
                                                                                                get_value: () => "\n--- TEST1 SUCCESSFUL ---",
                                                                                                cont: {
                                                                                                    command: "end"
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

export const test1: Config = {
    session: testTypesSession,
    program: mkTestTypesProgram(),
    port: 3000
}
