# @lpha

## Purpose

*@lpha* is a simple utility for running tasks in JS projects. It lets you extract bits of code that are usually part of automation or CI scripting. Possible use cases:
- SPA app deployment to AWS S3/CloudFront
- App packaging with Webpack (automatic, without need to create your own Webpack configuration) (see [pack-alpha-plugin](https://github.com/headline-1/pack-alpha-plugin))

### Installation

```bash
npm install @lpha/core -D
# or
yarn add @lpha/core -D
```

### Plugins

*@lpha* itself doesn't do much, as it is just a runner of commands that have to be defined as separate entities. It provides input validation mechanisms (using well-typed [io-ts](https://github.com/gcanti/io-ts)) and utilities for logging and file handling (see below).

#### Usage

To use an external plugin, install it using yarn or npm. Plugins should have `-alpha-plugin` package name suffix and they are detected automatically. Follow below syntax to run commands.
```bash
yarn @ [command-name] [--command-option=...]
```

All parameters of a command can be set using one of three methods:
* configuration file (a primary, always available)
* environmental variables (overrides configuration file, available if variable name has been set by plugin author)
* command line parameters (overrides env vars, available if variable name has been set by plugin author)

### Development

If you'd like to automate a task and create a plugin for that, just use `CommandBuilder` and `ParameterBuilder`:
```typescript
import { CommandBuilder, ParametersBuilder, Types, Logger } from '@lpha/core';

const TAG = 'My Command';

const command = new CommandBuilder()
  .name('my-command')
  .description('command-description')
  .parameters(
    new ParametersBuilder()
      .add('parameterName', {
        type: Types.string(), // Types equals to `T` from `io-ts`
        description: 'Your package type',
        required: true,
        cli: 'parameter-name',
        env: 'PARAMETER_NAME'
      })
      .build(),
  )
  .execute(async ({
    parameterName,
  }) => {
    Logger.log(TAG, 'Executing a task...');
    return await doSomething(parameterName);
  })
  .build();

// You can export the command(s) in many different ways:
export const cmd = command;
module.exports = command;
export default command;
export const commandsArray = [
  command,
];
export default [
  command,
];

```

`@lpha/core` package provides promisified utilities for file management:
- `makeDir`
- `readFile`
- `writeFile`
- `copyFile`
- `access`
- `rename`

Remember to define the `"main"` field in your `package.json`, so that *@lpha* could pick it up. To run such defined commands, run `@ self exported-command-name`.

If you'd like to run custom, per-project commands defined i.e. in `./commands/index.js` run `@ self:commands exported-command-name`.

### Configuration file

Configuration can be placed directly in `package.json`, like below:

```json
{
  "@": {
    "command-name": {
      "option": "value",
      "option2": 10
    }
  }
}
```

You can also place your configuration in a separate `js` or `json` file named: `@`, `a`, `@lpha` or `alpha`. Configuration file name can begin with a dot.
