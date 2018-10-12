import assert = require("assert");
import axios from 'axios';
import _ = require('lodash');
import {BaseProvider, ProviderOptions, Record, RecordData, RecordFilter, RecordParams} from "../provider";
import {clearTxtRecord} from "../utils";
import {RequestError} from "../errors";
import {CommandOption} from "../prog";
import {Logger} from "../logger";

interface GandiRecord {
  rrset_type: string;
  rrset_ttl: number;
  rrset_name: string;
  rrset_values: string[];
}

export = class GandiProvider extends BaseProvider {
  static cliopts: CommandOption[] = [{
    synopsis: '-T, --token',
    description: 'Specify the gandi api key to authenticate'
  }];

  readonly name: string = 'gandi';
  protected api;

  constructor(opts: ProviderOptions, logger?: Logger) {
    super(opts, logger);

    assert(opts.token, 'token is required');

    this.api = axios.create({
      baseURL: 'https://dns.api.gandi.net/api/v5',
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': this.token
      }
    });
  }

  get token() {
    return this.opts.token;
  }

  static create(opts: ProviderOptions, logger?: Logger): GandiProvider {
    return new this(opts, logger);
  }

  async authenticate(): Promise<any> {
    const paths = ['domains', this.domain];
    try {
      const {data} = await this.api.get(paths.join('/'));
      this.logger.debug('[gandi] ==> authenticated:', data.fqdn);
      return data;
    } catch (e) {
      raiseRequestError(e);
    }
  }

  async create(params: RecordData): Promise<void> {
    const records = await this.list(params);
    const current = records.map(r => r.content);
    if (!current || !current.includes(params.content)) {
      const name = this._relative(params.name) || '@';
      const paths = ['domains', this.domain, 'records', name];
      const record: GandiRecord = <GandiRecord>{};
      record.rrset_type = params.type;
      record.rrset_values = [params.content];
      if (current) {
        record.rrset_values.push(...current);
      }
      const ttl = params.ttl || this.opts.ttl;
      if (ttl) {
        record.rrset_ttl = ttl;
      }
      try {
        await this.api.post(paths.join('/'), record);
        this.logger.debug('[gandi] ==> create record: success');
      } catch (e) {
        raiseRequestError(e);
      }

    } else {
      this.logger.debug('[gandi] ==> create record: record exists, unchanged');
    }
  }

  async list(filter?: RecordFilter): Promise<Record[]> {
    const filterToUse: RecordFilter = filter || {};
    const paths = ['domains', this.domain];
    paths.push('records');
    const name = this._relative(filterToUse.name);
    if (name) {
      paths.push(name);
      if (filterToUse.type) {
        paths.push(filterToUse.type);
      }
    }

    try {
      const {data} = await this.api.get(paths.join('/'));
      let items: GandiRecord[] = Array.isArray(data) ? data : [data];
      if (!name && filterToUse.type) { // manual filter
        items = items.filter(item => item.rrset_type == filterToUse.type);
      }

      let answer: Record[] = [];

      items.forEach(item => {
        for (const value of item.rrset_values) {
          const record: Record = {
            id: item.rrset_name,
            type: item.rrset_type,
            name: this._full(item.rrset_name),
            ttl: item.rrset_ttl,
            content: value,
          };
          clearTxtRecord(record);
          answer.push(record);
        }
      });

      if (filterToUse.content) {
        answer = answer.filter(r => r.content === filterToUse.content);
      }

      this.logger.debug('[gandi] ==> list records:', answer);

      return answer;
    } catch (e) {
      throw raiseRequestError(e);
    }
  }

  async update(identifier: string, params: RecordParams): Promise<any> {
    const name = this._relative(identifier || params.name) || '@';
    const paths = ['domains', this.domain, 'records', name];

    const data: GandiRecord = <GandiRecord>{};
    if (params.type) {
      data.rrset_type = params.type;
    }
    const ttl = params.ttl || this.opts.ttl;
    if (ttl) {
      data.rrset_ttl = ttl;
    }
    if (params.content) {
      data.rrset_values = Array.isArray(params.content) ? params.content : [params.content];
    }

    try {
      const url = paths.join('/');
      const {data: answer} = await this.api.put(url, {items: [data]});
      this.logger.debug(`[gandi] ==> updated record - ${url}`, data);
      return answer;
    } catch (e) {
      raiseRequestError(e);
    }
  }

  async delete(identifier: string, params?: RecordFilter): Promise<void> {
    const name = this._relative(identifier || (params && params.name));
    const paths = ['domains', this.domain, 'records', name];
    if (!params) {
      const {data: answer} = await this.api.delete(paths.join('/'));
      this.logger.debug('[gandi] ==> delete all records with identifier "' + identifier + '"');
      return answer;
    }

    let removed = 0;
    const records = await this.list({type: params.type, name});

    // rearrange records by type
    const typed = {}, types = new Set();
    records.forEach(r => {
      if (!typed[r.type]) {
        typed[r.type] = [];
      }
      typed[r.type].push(r);
      types.add(r.type);
    });

    for (const type of types) {
      paths.push(type);

      const matches = typed[type];
      const remains = params.content ? matches.filter(record => record.content != params.content).map(record => record.content) : [];

      if (matches.length !== remains.length) {
        if (remains.length) {
          await this.api.put(paths.join('/'), {rrset_values: remains});
        } else {
          await this.api.delete(paths.join('/'));
        }
        removed++;
      }
    }

    if (!removed) {
      throw new Error('Record identifier could not be found.')
    }
  }

  async updyn(identifier: string, params: RecordParams): Promise<void> {
    params.type = params.type || 'A';
    params.ttl = params.ttl || 300;
    return await this.update(identifier, params);
  }
}

function raiseRequestError(e: Error) {
  throw new RequestError(_.get(e, 'response.data.message') || e.message, _.get(e, 'response.data'));
}
