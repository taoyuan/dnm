type LogCallback = (error?: any, level?: string, message?: string, meta?: any) => void;

interface LeveledLogMethod {
  (message: string, callback: LogCallback): Logger;
  (message: string, meta: any, callback: LogCallback): Logger;
  (message: string, ...meta: any[]): Logger;
  (infoObject: object): Logger;
}

export interface Logger {
  debug: LeveledLogMethod;
  info: LeveledLogMethod;
  log: LeveledLogMethod;
  warn: LeveledLogMethod;
  error: LeveledLogMethod;
}

export class NullLogger implements Logger {
  debug(...args): Logger {
    return this;
  }
  info(...args): Logger {
    return this;
  }
  log(...args): Logger {
    return this;
  }
  warn(...args): Logger {
    return this;
  }
  error(...args): Logger {
    return this;
  }
}

export const nullLogger = new NullLogger();
