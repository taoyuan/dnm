import {Provider, ProviderConstructor, ProviderOptions} from "../provider";
import {UnknownProvider} from "../errors";
import {Logger} from "../logger";

export function createProvider(provider: string, opts: ProviderOptions, logger?: Logger): Provider {
  let ProviderClass: ProviderConstructor;
  try {
    ProviderClass = require('./' + provider)
  } catch (e) {
    throw new UnknownProvider(provider);
  }
  return ProviderClass.create(opts, logger);
}

export const providers: {[name: string]: ProviderConstructor} = {
  gandi: require('./gandi'),
};
