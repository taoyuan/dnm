import ipily = require('ipily');

export class IPer {
  _ttl: number;
  _ip: string;
  _timestamp: number;

  constructor(ttl?: number) {
    this._ttl = ttl || 60;
  }

  async ip() {
    if (this._ip && (Date.now() - this._timestamp) < this._ttl) {
      return this._ip;
    }
    this._ip = await ipily();
    this._timestamp = Date.now();
    return this._ip;
  }
}
