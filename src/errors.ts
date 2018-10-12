export class UnknownProvider extends Error {
  constructor(provider: string) {
    super('Unknown provider: ' + provider);
  }
}

export class NotImplementedError extends Error {
  constructor(msg?: string) {
    super(msg || 'Not implemented');
  }
}

export class RequestError extends Error {
  data;

  constructor(e: Error);
  constructor(msg: string, data: any);
  constructor(msg: any, data?: any) {

    if (typeof msg !== "string") {
      data = msg && msg.response && msg.response.data;
      msg = msg && msg.message;
    }

    // if (data) {
    //   msg = msg + ':\n==>\n' + JSON.stringify(data, null, '  ') + '\n----';
    // }

    super(msg);
    this.data = data;
  }
}
