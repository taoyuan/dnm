// import chalk from "chalk";
// import program = require('caporal');
// import {CommandDescriptor} from "../prog";
// import {commands} from "./toolscmds";
// import {Logger} from "../logger";
//
// const pkg = require('../../package');
// program.version(pkg.version);
//
// const handleError = err => {
//   console.error();
//   console.error(err.message || err);
//   console.error();
//   if (err.stack) {
//     console.error(err.stack);
//     console.error();
//   }
//   process.exit(1);
// };
//
// function printUnknownCommand(cmdName) {
//   console.log(
//     [
//       '',
//       cmdName
//         ? chalk.red(`  Unrecognized command '${cmdName}'`)
//         : chalk.red("  You didn't pass any command"),
//       `  Run ${chalk.cyan(
//         'dnm --help',
//       )} to see list of all available commands`,
//       '',
//     ].join('\n'),
//   );
// }
//
// function addCommand(descriptor: CommandDescriptor) {
//
//   const cmd = program
//     .command(descriptor.command, descriptor.description || '')
//     .action(async function (args, opts, logger: Logger) {
//       try {
//         await descriptor.handler(args, opts, logger);
//       } catch (e) {
//         handleError(e);
//       }
//     });
//
//   const args = descriptor.args || [];
//   args.filter(a => a.synopsis).forEach(a => {
//     cmd.argument(a.synopsis, a.description, a.validator, a.default);
//   });
//
//   const options = descriptor.options || [];
//   options.filter(opt => opt.synopsis).forEach(o => {
//     cmd.option(o.synopsis, o.description, o.validator, o.default, o.required);
//   });
//
//   cmd.option('--user', 'Specify the auth username for some provider');
//   cmd.option('--pass', 'Specify the auth password for some provider');
//   cmd.option('--token', 'Specify the auth token for some provider');
//   cmd.option('--secret', 'Specify the auth secret for some provider');
// }
//
// export function tools(argv) {
//   commands.forEach(cmd => addCommand(cmd));
//   program.parse(argv);
//
//   const isValidCommand = commands.find(
//     cmd => cmd.command.split(' ')[0] === process.argv[2],
//   );
//
//   if (!isValidCommand) {
//     printUnknownCommand(process.argv[2]);
//     return;
//   }
//
// }
