/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata';
import path from 'path';
import { REST } from '@discordjs/rest';
import {
  ApplicationCommandPermissionType,
  RESTPutAPIApplicationGuildCommandsResult,
  RESTPutAPIGuildApplicationCommandsPermissionsJSONBody,
  Routes,
} from 'discord-api-types/v9';
import Container from 'typedi';
import glob from 'glob';
import { mapKeys } from 'lodash';
import { Config } from '../config';
import { Logger } from '../logger';
import { Command } from '../interfaces';

const logger = Container.get(Logger);
const commandsPath = path.join(__dirname, '..', 'commands');

const commandFiles = glob.sync(`${commandsPath}/**/*.{js,ts}`, {
  ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
});

const commands = [];

for (const file of commandFiles) {
  const command = require(file).default as Command;

  if (!command) {
    logger.warn(`Command is not a valid command.`, { file });
    continue;
  }

  if (command.data.enabled ?? true) {
    commands.push(command.data.toJSON());
  }
}

const config = Container.get(Config);
logger.info('Deploying commands...', {
  commands: commands.map((command) => command.name),
});
(async () => {
  const rest = new REST({ version: '9' }).setToken(config.discord.token);

  try {
    const applicationGuildCommandsResult = (await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      {
        body: commands,
      },
    )) as RESTPutAPIApplicationGuildCommandsResult;
    logger.info('Successfully registered application commands.');

    const commandsByName = mapKeys(applicationGuildCommandsResult, 'name');

    // https://discord.com/developers/docs/interactions/application-commands#batch-edit-application-command-permissions
    // You can only add up to 10 permission overwrites for a command.
    await rest.put(Routes.guildApplicationCommandsPermissions(config.discord.clientId, config.discord.guildId), {
      body: [
        {
          id: commandsByName['help'].id,
          permissions: [
            {
              id: config.discord.roles.everyone,
              permission: true,
              type: ApplicationCommandPermissionType.Role,
            },
            {
              id: config.discord.roles.admin,
              permission: true,
              type: ApplicationCommandPermissionType.Role,
            },
            {
              id: config.discord.roles.internal,
              permission: true,
              type: ApplicationCommandPermissionType.Role,
            },
            {
              id: config.discord.roles.restrictToChannel,
              permission: true,
              type: ApplicationCommandPermissionType.Role,
            },
          ],
        },
      ] as RESTPutAPIGuildApplicationCommandsPermissionsJSONBody,
    });
    logger.info('Successfully updated application commands permissions.');
  } catch (err) {
    logger.error('Could not deploy commands', { error: err as Error });
  }
})();
