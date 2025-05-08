import { Program, Session } from "./protocol";

const defaultSession: Session = { kind: 'end' };
const defaultProgram: Program = { command: 'end' };
const defaultPort: number = 3000;

const session: Session = defaultSession;

const program: Program = defaultProgram;

const port: number = defaultPort;

export const commandLine: any[] = [session, program, port];