// usage: change the default values with a json

import { Program, Session } from "./protocol";

const defaultSession: Session = { kind: 'end' };
const defaultProgram: Program = { command: 'end' };
const defaultPort: number = 3000;

export const defaultConfig = {
    session: defaultSession,
    program: defaultProgram,
    port: defaultPort
};
export type Config = {
    session: Session,
    program: Program,
    port: number
};
export function mkConfig(
    session: Session = defaultSession,
    program: Program = defaultProgram,
    port: number = defaultPort
): Config {
    return { session, program, port };
}
export function getSession(config: Config): Session {
    return config.session;
}
export function getProgram(config: Config): Program {
    return config.program;
}
export function getPort(config: Config): number {
    return config.port;
}




