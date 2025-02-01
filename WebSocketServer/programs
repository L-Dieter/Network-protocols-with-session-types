import { Type, Dir, Label, Session, Program } from './protocol';



export const mk_adder = (): Program => {
    var arg1: number, arg2: number;
    return {
        command: "recv",
        put_value: (v: any) => arg1 = v,
        cont: { command: "recv",
            put_value: (v: any) => arg2 = v,
            cont: { command: "send",
                get_value: () => arg1 + arg2,
                cont: {
                    command: "end"
                }
            }
        }
    }
}

export const mk_neg = (): Program => {
    var arg: number;
    return {
        command: "recv",
        put_value: (v: any) => arg = v,
        cont: {
            command: "send",
            get_value: () => -arg,
            cont: {
                command: "end"
            }
        }
    }
}

export const mk_arith = (): Program => {
    return {
        command: "choose",
        do_match: (label: Label) => null,
        alt_cont: {
            add: mk_adder(),
            neg: mk_neg()
        }
    }
}

export const mk_jsonAdd = (): Program => {
    var v_add: { arg1: number, arg2: number};
    return {
        command: "recv",
        put_value: (v: any) => v_add = v,
        cont: {
            command: "send",
            get_value: () => v_add.arg1 + v_add.arg2,
            cont: {
                command: "end"
            }
        }
    }
}

export const mk_stringNeg = (): Program => {
    var arg: string;
    return {
        command: "recv",
        put_value: (v: any) => arg = v,
        cont: {
            command: "send",
            get_value: () => -nameToNumber(arg),
            cont: {
                command: "end"
            }
        }
    }
}


// turns a written out number to a number (only 1 - 9)
const nameToNumber = (name: string): number => {
    let num: number;
    switch(name) {
        case "one": { num = 1; break; }
        case "two": { num = 2; break; }
        case "three": { num = 3; break; }
        case "four": { num = 4; break; }
        case "five": { num = 5; break; }
        case "six": { num = 6; break; }
        case "seven": { num = 7; break; }
        case "eight": { num = 8; break; }
        case "nine": { num = 9; break; }
        default: { num = 0; break; }
    }
    return num;
}
