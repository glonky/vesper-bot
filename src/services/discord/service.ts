import path from 'path';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { Client, Collection } from 'discord.js';
import glob from 'glob';
import Container, { Service } from 'typedi';
import { Config } from '../../config';
import { Command, RestrictedRole } from '../../interfaces';
import { Logger, LoggerDecorator } from '../../logger';

@Service()
export class DiscordService {
  @LoggerDecorator()
  private logger!: Logger;

  public commands: Collection<string, Command> = new Collection();

  public client?: Client;

  private _restrictToRoles?: RestrictedRole[];

  private _restrictToChannels?: string[];

  private _rateLimit?: number;

  public get restrictToRoles() {
    return this._restrictToRoles;
  }

  public get restrictToChannels() {
    return this._restrictToChannels;
  }

  public get rateLimit() {
    return this._rateLimit;
  }

  public setRestrictToRoles(roles: (RestrictedRole | undefined)[]) {
    this._restrictToRoles = roles.filter(Boolean) as RestrictedRole[];
  }

  public setRateLimit(rateLimit?: number) {
    this._rateLimit = rateLimit ?? Container.get(Config).commandRateLimit;
  }

  public setRestrictToChannels(channels: (string | undefined)[]) {
    this._restrictToChannels = channels.filter(Boolean) as string[];
  }

  public async start() {
    const config = Container.get(Config);

    this.client = new Client({ intents: config.discord.intents });
    // Login to Discord with your client's token
    this.logger.info(`Logging in to Discord...`);
    await this.client.login(config.discord.token);

    this.loadCommands();
    this.loadEvents();

    return this;
  }

  public findChannelByName(name: string) {
    return this.client?.guilds.cache.first()?.channels.cache.find((channel) => channel.name === name);
  }

  public findRoleByName(name: string) {
    return this.client?.guilds.cache.first()?.roles.cache.find((role) => role.name === name);
  }

  private loadCommands() {
    const commandsPath = path.join(__dirname, '..', '..', 'commands');

    const commandFiles = glob.sync(`${commandsPath}/**/*.{js,ts}`, {
      ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
    });

    for (const file of commandFiles) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(file).default as Command;

      if (!command) {
        this.logger.warn(`Command is not a valid command.`, { file });
        continue;
      }

      // Set a new item in the Collection
      // With the key as the command name and the value as the exported module
      this.commands.set(command.data.name, command);

      if (command.data.options) {
        for (const option of command.data.options) {
          const optionAsSubCommand = option as SlashCommandSubcommandBuilder;
          this.logger.info(`Loading sub-command`, {
            command: command.data.name,
            subCommand: optionAsSubCommand.name,
          });
          this.commands.set(`${command.data.name}.${optionAsSubCommand.name}`, command);
        }
      } else {
        this.logger.info(`Loading command`, {
          command: command.data.name,
        });
      }
    }
  }

  private loadEvents() {
    const eventsPath = path.join(__dirname, '..', '..', 'events');

    const eventFiles = glob.sync(`${eventsPath}/**/*.{js,ts}`, {
      ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
    });

    for (const file of eventFiles) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const event = require(file).default;
      this.logger.info(`Loading event`, {
        command: event.name,
      });

      if (event.once) {
        this.client?.once(event.name, (...args) => event.execute(...args));
      } else {
        this.client?.on(event.name, (...args) => event.execute(...args));
      }
    }
  }
}
