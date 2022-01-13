import path from 'path';
import { REST } from '@discordjs/rest';
import type {
  RESTGetAPIApplicationGuildCommandsResult,
  RESTPutAPIApplicationGuildCommandsResult,
  RESTPutAPIGuildApplicationCommandsPermissionsJSONBody,
} from 'discord-api-types/v9';
import { ApplicationCommandPermissionType, Routes } from 'discord-api-types/v9';
import Container from 'typedi';
import glob from 'glob';
import { Config, Command } from '@vesper-discord/discord-service';
import { flags } from '@oclif/command';
import { BaseCommand } from '../base-command';

export default class DeployDiscordCommands extends BaseCommand {
  static flags = {
    commandsPath: flags.string({
      char: 'c',
      description: 'The path where the commands exist.',
      required: true,
    }),
  };

  static description = 'Deploys commands to the discord server.';

  static examples = ['$ vesper deploy-discord-commands -c package/command-bot/src/commands'];

  async runHandler() {
    const { flags: cliFlags } = this.parse(DeployDiscordCommands);

    const { commandsPath } = cliFlags;
    this.logger.info('Deploying commands', { commandsPath });

    // TODO: Pull this from the discord service.
    const commandFiles = glob.sync(`${commandsPath}/**/*.{js,ts}`, {
      ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
    });

    const commands: Command[] = [];
    const disabledCommands: Command[] = [];

    for (const file of commandFiles) {
      const fullFilePath = path.join(__dirname, '../../../../', file);
      this.logger.info('Loading command', { file, fullFilePath });
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(fullFilePath).default as Command;

      if (!command) {
        this.logger.warn(`Command is not a valid command.`, { file });
        continue;
      }

      if (command.data.enabled ?? true) {
        commands.push(command);
      } else {
        disabledCommands.push(command);
      }
    }

    const config = Container.get(Config);

    this.logger.info('Deploying commands...', {
      commands: commands.map((command) => command.data.name),
    });

    const rest = new REST({ version: '9' }).setToken(config.token);

    try {
      const applicationGuildPutCommandsResult = (await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        {
          body: commands.map((command) => command.data.toJSON()),
        },
      )) as RESTPutAPIApplicationGuildCommandsResult;

      this.logger.info('Successfully registered application commands.');

      const applicationGuildGetCommandsResult = (await rest.get(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
      )) as RESTGetAPIApplicationGuildCommandsResult;

      this.logger.info('found all commands', {
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
            this.logger.info('Found command that should be disabled. Disabling', {
              commandId: apiCommand.id,
              commandName: disabledCommand.data.name,
            });
            // await rest.delete(
            // Routes.applicationGuildCommand(config.discord.clientId, config.discord.guildId, apiCommand.id),
            // );

            return;
          }
          if (disabledSubCommand) {
            this.logger.info('Found subcommand that should be disabled. Disabling', {
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
      await rest.put(Routes.guildApplicationCommandsPermissions(config.clientId, config.guildId), {
        body: permissions,
      });
      this.logger.info('Successfully updated application commands permissions.');
    } catch (err) {
      this.logger.error('Could not deploy commands', { error: err as Error });
    }
  }
}
