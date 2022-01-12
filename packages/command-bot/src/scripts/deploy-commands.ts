/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import path from 'path';
import { REST } from '@discordjs/rest';
import {
  ApplicationCommandPermissionType,
  RESTGetAPIApplicationGuildCommandsResult,
  RESTPutAPIApplicationGuildCommandsResult,
  RESTPutAPIGuildApplicationCommandsPermissionsJSONBody,
  Routes,
} from 'discord-api-types/v9';
import Container from 'typedi';
import glob from 'glob';
import { Config } from '../config';
import { Logger } from '../logger';
import { Command } from '../interfaces';

const logger = Container.get(Logger);
const commandsPath = path.join(__dirname, '..', 'commands');

// TODO: Pull this from the discord service.
const commandFiles = glob.sync(`${commandsPath}/**/*.{js,ts}`, {
  ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
});

const commands: Command[] = [];
const disabledCommands: Command[] = [];

for (const file of commandFiles) {
  const command = require(file).default as Command;

  if (!command) {
    logger.warn(`Command is not a valid command.`, { file });
    continue;
  }

  if (command.data.enabled ?? true) {
    commands.push(command);
  } else {
    disabledCommands.push(command);
  }
}

const config = Container.get(Config);

logger.info('Deploying commands...', {
  commands: commands.map((command) => command.data.name),
});

(async () => {
  const rest = new REST({ version: '9' }).setToken(config.discord.token);

  try {
    const applicationGuildPutCommandsResult = (await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      {
        body: commands.map((command) => command.data.toJSON()),
      },
    )) as RESTPutAPIApplicationGuildCommandsResult;

    logger.info('Successfully registered application commands.');

    const applicationGuildGetCommandsResult = (await rest.get(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
    )) as RESTGetAPIApplicationGuildCommandsResult;

    logger.info('found all commands', {
      applicationGuildGetCommandsResult,
    });

    await Promise.all(
      applicationGuildGetCommandsResult.map(async (apiCommand) => {
        let disabledCommand: Command | undefined;
        let disabledSubCommand: Command | undefined;
        disabledCommands.forEach((command) => {
          if (command.data.name === apiCommand.name) {
            disabledCommand = command;
          }

          const subCommand = apiCommand.options?.find((option) => option.name === command.data.name);

          if (subCommand) {
            disabledSubCommand = command;
          }
        });

        if (disabledCommand) {
          logger.info('Found command that should be disabled. Disabling', {
            commandId: apiCommand.id,
            commandName: disabledCommand.data.name,
          });
          // await rest.delete(
          // Routes.applicationGuildCommand(config.discord.clientId, config.discord.guildId, apiCommand.id),
          // );

          return;
        }
        if (disabledSubCommand) {
          logger.info('Found subcommand that should be disabled. Disabling', {
            commandId: apiCommand.id,
            commandName: disabledSubCommand.data.name,
          });
          // await rest.delete(
          // Routes.applicationGuildCommand(config.discord.clientId, config.discord.guildId, apiCommand.id),
          // );

          return;
        }
      }),
    );

    const permissions: RESTPutAPIGuildApplicationCommandsPermissionsJSONBody = [];

    applicationGuildPutCommandsResult.forEach(async (apiCommand) => {
      const command = commands.find((c) => c.data.name === apiCommand.name);
      if (command?.data.restrictToRoles && command.data.restrictToRoles.length > 0) {
        permissions.push({
          id: apiCommand.id,
          permissions: command.data.restrictToRoles.map((role) => ({
            id: role.id,
            permission: role.allowed,
            type: ApplicationCommandPermissionType.Role,
          })),
        });
      }
    });

    // https://discord.com/developers/docs/interactions/application-commands#batch-edit-application-command-permissions
    // You can only add up to 10 permission overwrites for a command.
    await rest.put(Routes.guildApplicationCommandsPermissions(config.discord.clientId, config.discord.guildId), {
      body: permissions,
    });
    logger.info('Successfully updated application commands permissions.');
  } catch (err) {
    logger.error('Could not deploy commands', { error: err as Error });
  }
})();
