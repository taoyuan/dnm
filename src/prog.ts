import {Logger} from "./logger";

export const INT = 1 << 0;
export const FLOAT = 1 << 1;
export const BOOL = 1 << 2;
export const STRING = 1 << 3;
export const LIST = 1 << 4;
export const REPEATABLE = 1 << 5;
export const REQUIRED = 1 << 6;

export interface CommandOption {
  synopsis: string;
  description: string;
  validator?: string[] | string | RegExp | Number | ((val: string) => any)
  default?: any;
  required?: boolean;
}

export interface CommandExample {
  desc: string;
  cmd: string;
}

export interface CommandDescriptor {
  command: string;
  description?: string;
  usage?: string;
  args?: CommandOption[];
  options?: CommandOption[];
  examples?: CommandExample[];
  handler: (args: { [name: string]: any }, opts: { [name: string]: any }, logger: Logger) => Promise<void>;
}
