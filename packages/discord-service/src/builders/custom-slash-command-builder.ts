import { SlashCommandBuilder as DiscordSlashCommandBuilder } from '@discordjs/builders';
import { Logger, LoggerDecorator } from '@vesper-discord/logger';
import { InteractionEventExecuteProps, InteractionExecuteFunction, RestrictedRole } from '../interfaces';
import { CustomSlashCommandSubcommandBuilder } from './custom-slash-command-sub-command-builder';

export class CustomSlashCommandBuilder extends DiscordSlashCommandBuilder {
  @LoggerDecorator()
  private logger!: Logger;

  private executeFn?: InteractionExecuteFunction;

  private _enabled?: boolean;

  private _restrictToRoles?: RestrictedRole[];

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

  public get restrictToRoles() {
    return this._restrictToRoles;
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

  public setRestrictToRoles(roles: RestrictedRole[]): this {
    this._restrictToRoles = roles;
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

  public addCustomSubcommand(
    input:
      | CustomSlashCommandSubcommandBuilder
      | ((subcommandGroup: CustomSlashCommandSubcommandBuilder) => CustomSlashCommandSubcommandBuilder),
  ) {
    const { options } = this;

    // First, assert options conditions - we cannot have more than 25 options
    // validateMaxOptionsLength(options);

    // Get the final result
    const result = typeof input === 'function' ? input(new CustomSlashCommandSubcommandBuilder()) : input;

    // assertReturnOfBuilder(result, SlashCommandSubcommandBuilder);

    // Push it
    options.push(result);

    return this;
  }
}
