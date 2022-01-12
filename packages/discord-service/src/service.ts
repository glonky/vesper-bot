import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { Client, Collection } from 'discord.js';
import glob from 'glob';
import { Inject, Service } from 'typedi';
import { Logger, LoggerDecorator } from '@vesper-discord/logger';
import { Command, RestrictedRole } from './interfaces';
import { Config } from './config';

@Service()
export class DiscordService {
  @LoggerDecorator()
  private logger!: Logger;

  @Inject()
  private config!: Config;

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
    this._rateLimit = rateLimit ?? this.config.commandRateLimit;
  }

  public setRestrictToChannels(channels: (string | undefined)[]) {
    this._restrictToChannels = channels.filter(Boolean) as string[];
  }

  public async start() {
    this.client = new Client({ intents: this.config.intents });
    // Login to Discord with your client's token
    this.logger.info(`Logging in to Discord...`);
    await this.client.login(this.config.token);

    return this;
  }

  public findChannelByName(name: string) {
    return this.client?.guilds.cache.first()?.channels.cache.find((channel) => channel.name === name);
  }

  public findRoleByName(name: string) {
    return this.client?.guilds.cache.first()?.roles.cache.find((role) => role.name === name);
  }

  public loadCommands(commandsPath: string) {
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
          this.logger.debug(`Loading sub-command`, {
            command: command.data.name,
            subCommand: optionAsSubCommand.name,
          });
          this.commands.set(`${command.data.name}.${optionAsSubCommand.name}`, command);
        }
      } else {
        this.logger.debug(`Loading command`, {
          command: command.data.name,
        });
      }
    }
  }

  public loadEvents(eventsPath: string) {
    // const eventsPath = path.join(__dirname, '..', '..', 'events');

    const eventFiles = glob.sync(`${eventsPath}/**/*.{js,ts}`, {
      ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
    });

    for (const file of eventFiles) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const event = require(file).default;
      this.logger.debug(`Loading event`, {
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
