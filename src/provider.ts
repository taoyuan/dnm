import * as assert from "assert";
import {NotImplementedError} from "./errors";
import {rstrip} from "./utils";
import {CommandOption} from "./prog";
import {Logger, nullLogger} from "./logger";
import _ = require('lodash');

export interface RecordFilter {
  name?: string;
  type?: string;
  content?: any;
}

export interface RecordData {
  name: string;
  type: string;
  content: any;
  ttl?: number;
}

export interface RecordParams {
  name?: string;
  type?: string;
  ttl?: number;
  content?: any;
}

export interface ProviderBaseOptions {
  domain?: string;
  ttl?: number;
}

export interface ProviderAuthOptions {
  user?: string;
  pass?: string;
  token?: string;
  secret?: string;
}

export interface ProviderOptions extends ProviderBaseOptions, ProviderAuthOptions {

}

export interface Record {
  id: string;
  type: string;
  name: string;
  ttl: number;
  content: any;
}

const DEFAULTS = {
  ttl: 3600
};

export interface ProviderConstructor {
  readonly cliopts: CommandOption[];

  create(opts: ProviderOptions, logger?: Logger): Provider;
}

export interface Provider {
  readonly name: string;

  readonly logger: Logger;

  authenticate(): Promise<any>;

  create(params: RecordData): Promise<void>;

  list(filter?: RecordFilter): Promise<Record[]>;

  update(identifier: string, params?: RecordParams): Promise<void>;

  delete(identifier: string, params?: RecordFilter): Promise<void>;

  updyn(identifier: string, params?: RecordParams): Promise<void>;
}

export class BaseProvider implements Provider {
  readonly name: string = 'example';

  readonly logger: Logger;

  constructor(opts: ProviderOptions, logger?: Logger) {
    assert(opts.domain, 'domain is required');
    this.logger = logger || nullLogger;
    // @ts-ignore
    this._domain = opts.domain.toLowerCase();
    this._opts = _.defaults(opts, DEFAULTS);
  }

  protected _domain: string;

  get domain() {
    return this._domain;
  }

  protected _opts: ProviderOptions;

  get opts() {
    return this._opts;
  }

  async authenticate(): Promise<any> {
    throw new NotImplementedError();
  }

  async create(params: RecordData): Promise<void> {
    throw new NotImplementedError();
  }

  async list(filter?: RecordFilter): Promise<Record[]> {
    throw new NotImplementedError();
  }

  async update(identifier: string, params?: RecordParams): Promise<void> {
    throw new NotImplementedError();
  }

  async delete(identifier: string, params?: RecordFilter): Promise<void> {
    throw new NotImplementedError();
  }

  async updyn(identifier: string, params: RecordParams): Promise<void> {
    throw new NotImplementedError();
  }

  protected _fqdn(name: string): string {
    return this._full(name);
  }

  protected _full(name: string): string {
    name = rstrip(name, '.');
    if (!name.endsWith(this.domain)) {
      return `${name}.${this.domain}`;
    }
    return name;
  }

  protected _relative(name: string | any): string {
    if (name == null) {
      return '';
    }
    name = rstrip(name, '.');
    if (name.endsWith(this.domain)) {
      return rstrip(name.substr(0, name.length - this.domain.length), '.');
    }
    return name;
  }
}
