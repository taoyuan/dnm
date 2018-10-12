import {Logger} from "../logger";
import {load} from "../config";
import {Executor} from "../executor";
import program = require('caporal');
import _ = require('lodash');

const pkg = require('../../package');

program.version(pkg.version);

const handleError = err => {
  console.error();
  console.error(err.message || err);
  console.error();
  if (err.stack) {
    console.error(err.stack);
    console.error();
  }
  process.exit(1);
};

export function updyn(argv) {
  program
    .description('Dynamic update domain ip records')
    .argument('[provider]', 'Specify the dns provider')
    .argument('[domains]', 'Specify the domains to execute, could be list')
    .option('-t, --type', 'Specify the entry type', ['A', 'AAAA'], 'A')
    .option('-l, --ttl', 'Specify the record time-to-live', program.INT, 300)
    .option('-c, --conf', 'Path to the updyn configuration file')
    .option('-U, --user', 'Specify the auth username for some provider')
    .option('-P, --pass', 'Specify the auth password for some provider')
    .option('-T, --token', 'Specify the auth token for some provider')
    .option('-S, --secret', 'Specify the auth secret for some provider')
    .action(async function (args, opts, logger: Logger) {
      try {
        await execute(args, opts, logger);
      } catch (e) {
        handleError(e);
      }
    });

  program.parse(argv);
}

async function execute(args, opts, logger) {
  if (opts.conf) {
    logger.debug('execute with config:', opts.conf);
    await executeWithConfig(args, opts, logger);
  } else if (args.provider) {
    logger.debug('execute with provider:', args.provider);
    await executeWithProvider(args, opts, logger);
  } else {
    throw new Error('no provider or config file provided');
  }
}

async function executeWithProvider(args, opts, logger) {
  const {provider, domains} = args;
  if (!domains || !domains.length) {
    throw new Error('no domains provided')
  }

  await Executor.execute(provider, 'updyn', domains, opts, logger);
}

async function executeWithConfig(args, opts, logger) {
  const {conf} = opts;
  const entries = load(conf);
  if (!_.isPlainObject(entries)) {
    throw new Error(`config content in "${conf}" should be a plain object.`);
  }
  const providers = Object.keys(entries);

  for (const provider of providers) if (entries[provider]) {
    await Executor.execute(provider, 'updyn', entries[provider], opts, logger);
  }
}
