import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { Client, ClientOptions, Collection, Guild, GuildMember } from 'discord.js';
import glob from 'glob';
import { Container } from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { Retriable } from '@vesper-discord/retry';
import { Command, RestrictedRole } from './interfaces/index';
export interface DiscordClientStartProps {
  token: string;
  startWebsocket?: boolean;
}

export class DiscordClient extends Client {
  private logger!: Logger;

  public commands: Collection<string, Command> = new Collection();

  private _restrictToRoles?: RestrictedRole[];

  private _restrictToChannels?: string[];

  private _rateLimit?: number;

  private _guild?: Guild;

  private _botMember?: GuildMember;

  public get restrictToRoles() {
    return this._restrictToRoles;
  }

  public get restrictToChannels() {
    return this._restrictToChannels;
  }

  public get rateLimit() {
    return this._rateLimit;
  }

  public get guild() {
    return this._guild;
  }

  public get botMember() {
    return this._botMember;
  }

  constructor(props: ClientOptions) {
    super(props);
    this.logger = Container.get(Logger);
    this.logger.setName('DiscordClient');
  }

  public setRestrictToRoles(roles: (RestrictedRole | undefined)[]) {
    this._restrictToRoles = roles.filter(Boolean) as RestrictedRole[];
  }

  public setRateLimit(rateLimit: number) {
    this._rateLimit = rateLimit;
  }

  public setRestrictToChannels(channels: (string | undefined)[]) {
    this._restrictToChannels = channels.filter(Boolean) as string[];
  }

  @Retriable()
  public async start({ token, startWebsocket }: DiscordClientStartProps) {
    this.logger.info(`Logging into Discord...`);
    this.token = token;

    if (startWebsocket ?? true) {
      await this.login();
    }

    const guild = this.guilds.cache.first();

    if (guild) {
      this._guild = guild;
    }

    if (this._guild && this.user) {
      this._botMember = await this._guild.members.fetch(this.user.id);
    }

    return this;
  }

  public findChannelByName(name: string) {
    return this.guilds.cache.first()?.channels.cache.find((channel) => channel.name === name);
  }

  public findRoleByName(name: string) {
    return this.guilds.cache.first()?.roles.cache.find((role) => role.name === name);
  }

  public async loadCommands(commandsPath: string) {
    const commandFiles = glob.sync(`${commandsPath}/**/*.{js,ts}`, {
      ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
    });

    await Promise.all(
      commandFiles.map(async (file) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command = (await import(file)).default as Command;

        if (!command) {
          this.logger.warn(`Command is not a valid command.`, { file });
          return;
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
      }),
    );
  }

  public async loadEvents(eventsPath: string) {
    const eventFiles = glob.sync(`${eventsPath}/**/*.{js,ts}`, {
      ignore: ['**/__tests__/**', '**/*.d.ts', '**/*.map.*'],
    });

    await Promise.all(
      eventFiles.map(async (file) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const event = (await import(file)).default;
        this.logger.debug(`Loading event`, {
          name: event.name,
        });

        if (event.once) {
          this.once(event.name, (...args) => {
            this.logger.debug('Event fired', {
              name: event.name,
            });
            return event.execute({ ...args, client: this });
          });
        } else {
          this.on(event.name, (...args) => {
            this.logger.debug('Event fired', {
              name: event.name,
            });
            return event.execute({ ...args, client: this });
          });
        }
      }),
    );
  }
}
