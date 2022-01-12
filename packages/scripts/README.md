# Scripts
A collection of scripts that are used to automate the process of building and deploying vesper tools.

## New commands

* Create a new file in the `src/commands` directory.
* The name of the file will be the name of the command.

## View all commands
`vesper commands`

## Help
`vesper help`

## Autocomplete
See https://github.com/oclif/plugin-autocomplete

## Link globally
> Using NPM
`cd packages/scripts && npm link`

> Using NPM
`cd packages/scripts && yarn link`

Now you can use `vesper [command]` to run the command.