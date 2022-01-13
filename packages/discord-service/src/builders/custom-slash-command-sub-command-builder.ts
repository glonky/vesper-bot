import { SlashCommandSubcommandBuilder as DiscordSlashCommandSubcommandBuilder } from '@discordjs/builders';
import { Logger, LoggerDecorator } from '@vesper-discord/logger';
import { InteractionEventExecuteProps, InteractionExecuteFunction } from '../interfaces/events/interaction';

export class CustomSlashCommandSubcommandBuilder extends DiscordSlashCommandSubcommandBuilder {
  @LoggerDecorator()
  private logger!: Logger;

  private executeFn?: InteractionExecuteFunction;

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
  public setRateLimit(rateLimit: number): this {
    this._rateLimit = rateLimit;
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

  public setExecute(executeFn: InteractionExecuteFunction): this {
    this.executeFn = executeFn;
    return this;
  }

  public async execute(props: InteractionEventExecuteProps) {
    if (!this.executeFn) {
      this.logger.warn('No execute function set for this command');
      return;
    }

    return this.executeFn(props);
  }
}
