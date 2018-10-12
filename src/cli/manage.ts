import chalk from "chalk";
import program = require('caporal');
import _ = require('lodash');
import psl = require('psl');
import Table = require('easy-table');
import {ProviderConstructor} from "../provider";
import {createProvider, providers} from "../providers";
import {authFromEnv} from "../utils";
import {Executor} from "../executor";
import {log} from "util";

const pkg = require('../../package');

program.version(pkg.version);

function handleError(err) {
  console.error();
  console.error(err.message || err);
  console.error();
  if (err.stack) {
    console.error(err.stack);
    console.error();
  }
  process.exit(1);
}

function printUnknownCommand(cmdName) {
  console.log(
    [
      '',
      cmdName
        ? chalk.red(`  Unrecognized command '${cmdName}'`)
        : chalk.red("  You didn't pass any command"),
      `  Run ${chalk.cyan(
        'dnm --help',
      )} to see list of all available commands`,
      '',
    ].join('\n'),
  );
}

function addCommand(name: string, provider: ProviderConstructor) {
  const cmd = program
    .command(name, `Manage DNS records that hosted in ${name}`)
    .help(`Manage DNS records that hosted in ${name}`)
    .argument('<action>', 'Specify the action to take', ['create', 'list', 'update', 'delete', 'updyn'])
    .argument('<domain>', 'Specify the domain, supports subdomains as well')
    .option('-n, --name', 'Specify the record name')
    .option('-t, --type', 'Specify the entry type', ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'SOA', 'TXT', 'SRV', 'LOC'])
    .option('-d, --content', 'Specify the record content')
    .option('-l, --ttl', 'Specify the record time-to-live', program.INT)
    .option('-i, --priority', 'Specify the record priority')
    .option('-o, --output', 'Specify the output format in table,transposed,json', ['table', 'table-no-header', 'json'])
    .action(async function (args, opts, logger) {
      try {
        await runAction(name, args, opts, logger);
      } catch (e) {
        handleError(e);
      }
    });

  provider.cliopts && provider.cliopts.forEach(o => {
    cmd.option(o.synopsis, o.description, o.validator, o.default, o.required);
  });
}

async function runAction(name: string, args, opts, logger) {
  opts = _.defaults(opts, authFromEnv(name));
  // auto fill name with full domain
  //
  // example: $0 create www.example.com -d 1.1.1.1
  // will using www.example.com as the name
  //
  // but: $0 create example.com -d 1.1.1.1
  // will not do this
  if (!opts.identifier && !opts.name && opts.domain !== args.domain) {
    opts.name = args.domain;
  }

  const answer = await Executor.execute(name, args.action, args.domain, opts, logger);

  if (!opts.quiet) {
    printOutput(answer, opts.output || 'table', logger);
  }
}

function printOutput(data: any, format: string, logger: Logger) {
  if (!data) {
    return logger.debug(`Output is empty, and can not be printed with "${format}" format`)
  }

  if (!Array.isArray(data)) {
    return logger.debug(`Output is not iterable, and then cannot be printed with "${format}" format\``)
  }

  if (format === 'json') {
    console.log(JSON.stringify(data));
  } else {
    console.log(generateTable(data, format !== 'table-no-header', logger))
  }
}

function generateTable(items: any[], showHeader: boolean, logger: Logger) {
  const table = new Table();
  for (const item of items) {
    table.cell('ID', _.get(item, 'id'));
    table.cell('TYPE', _.get(item, 'type'));
    table.cell('NAME', _.get(item, 'name'));
    table.cell('CONTENT', _.get(item, 'content'));
    table.cell('TTL', _.get(item, 'ttl'), Table.number());
    table.newRow();
  }
  return (showHeader ? table.toString() : table.print()).trimRight(); // trim last "\n"
}

export function manage(argv) {
  const names = Object.keys(providers);
  names.forEach(name => addCommand(name, providers[name]));

  program.parse(argv);

  const isValidCommand = names.includes(process.argv[2]);

  if (!isValidCommand) {
    printUnknownCommand(process.argv[2]);
    return;
  }
}
