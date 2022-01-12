import { SlashCommandSubcommandBuilder as DiscordSlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import Container from 'typedi';
import { Config } from '../config';
import { Logger, LoggerDecorator } from '../logger';

export class SlashCommandSubcommandBuilder extends DiscordSlashCommandSubcommandBuilder {
  @LoggerDecorator()
  private logger!: Logger;

  private executeFn?: (interaction: CommandInteraction) => Promise<any>;

  private _enabled?: boolean;

  private _restrictToChannels?: string[];

  private _rateLimit?: number;

  /**
   * Rate limit in seconds
   */
  public get rateLimit() {
    return this._rateLimit;
  }

  public get enabled() {
    return this._enabled;
  }

  public get restrictToChannels() {
    return this._restrictToChannels;
  }

  /**
   * Rate limit in seconds
   */
  public setRateLimit(rateLimit?: number): this {
    this._rateLimit = rateLimit ?? Container.get(Config).commandRateLimit;
    return this;
  }

  public setEnabled(enabled: boolean): this {
    this._enabled = enabled;
    return this;
  }

  public setRestrictToChannels(channels: (string | undefined)[]): this {
    this._restrictToChannels = channels.filter(Boolean) as string[];
    return this;
  }

  public setExecute(executeFn: (interaction: CommandInteraction) => any): this {
    this.executeFn = executeFn;
    return this;
  }

  public async execute(interaction: CommandInteraction) {
    if (!this.executeFn) {
      this.logger.warn('No execute function set for this command');
      return;
    }

    return this.executeFn(interaction);
  }
}