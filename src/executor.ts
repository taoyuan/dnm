import _ = require('lodash');
import psl = require('psl');
import {Provider, ProviderOptions, Record, RecordData, RecordFilter} from "./provider";
import {createProvider} from "./providers";
import {IPer} from "./iper";
import {Logger} from "./logger";
import {aggregate, authFromEnv} from "./utils";

const ipser = new IPer();

export interface ExecuteParams {
  type?: string;
  identifier?: string;
  name?: string;
  ttl?: number;
  content?: any;
}

export class Executor {
  protected _provider: Provider;
  protected _ready: Promise<void>;

  constructor(provider: Provider) {
    this._provider = provider;
    this._ready = provider.authenticate();
  }

  static async execute(provider: string, action: string, domains: string | string[], opts: ProviderOptions & ExecuteParams, logger: Logger) {
    opts = _.defaults(opts, authFromEnv(provider));
    const {type, ttl} = opts;

    domains = Array.isArray(domains) ? domains : [domains];
    const aggregated = aggregate(domains, domain => psl.get(domain));
    const names = Object.keys(aggregated);

    const answer = {};
    for (const domain of names) {
      const p = createProvider(provider, {domain, ...opts}, logger);
      const executor = Executor.create(p);
      const items = aggregated[domain].map(name => ({name, type, ttl}));
      answer[domain] = await executor.execute(action, items.length > 1 ? items : items[0]);
    }
    return names.length > 1 ? answer : answer[names[0]];
  }

  static create(provider: Provider): Executor;

  static create(provider: string, options: ProviderOptions): Executor;

  static create(provider: string | Provider, options?: ProviderOptions): Executor {
    if (typeof provider === 'string') {
      return new this(createProvider(provider, <ProviderOptions>options));
    }
    return new this(provider);
  }

  async execute(action: string, params: ExecuteParams | ExecuteParams[]) {
    await this._ready;
    switch (action) {
      case 'create':
        return await this.create(params);
      case 'list':
        return await this.list(params);
      case 'update':
        return await this.update(params);
      case 'delete':
        return await this.delete(params);
      case 'updyn':
        return await this.updyn(params);
      default:
        throw new Error('unsupported action: ' + action);
    }
  }

  async create(params: ExecuteParams | ExecuteParams[]): Promise<void> {
    await this._ready;
    if (!Array.isArray(params)) {
      return await this._provider.create(<RecordData>params);
    }
    params.forEach(async item => await this._provider.create(<RecordData>item));
  }

  async list(params: ExecuteParams | ExecuteParams[]): Promise<Record[] | Record[][]> {
    await this._ready;
    if (!Array.isArray(params)) {
      return await this._provider.list(<RecordFilter>params);
    }
    const answer: Record[][] = [];
    for (const item of params) {
      answer.push(await this._provider.list(<RecordFilter>item));
    }
    return answer;
  }

  async update(params: ExecuteParams | ExecuteParams[]): Promise<void> {
    await this._ready;
    if (!Array.isArray(params)) {
      return await this._provider.update(params.identifier || '', params);
    }
    params.forEach(async item => await this._provider.update(item.identifier || '', item));
  }

  async delete(params: ExecuteParams | ExecuteParams[]): Promise<void> {
    await this._ready;
    if (!Array.isArray(params)) {
      return await this._provider.delete(params.identifier || '', params);
    }
    params.forEach(async item => await this._provider.delete(item.identifier || '', item));
  }

  async updyn(items: ExecuteParams[] | string[] | ExecuteParams | string) {
    await this._ready;
    const arritems = Array.isArray(items) ? items : [items];
    // normalize and resolve items
    let resolved: ExecuteParams[] = [];
    // @ts-ignore
    for (const item of arritems) {
      let i: ExecuteParams;
      if (typeof item === 'string') {
        i = {name: item, content: ''};
      } else {
        i = item;
      }
      if (!i.content) {
        i.content = await ipser.ip();
      }
      resolved.push(i);
    }

    for (const item of resolved) {
      await this._provider.updyn(item.identifier || '', item);
    }
  }

}
