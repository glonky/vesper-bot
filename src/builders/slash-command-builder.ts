import { SlashCommandBuilder as DiscordSlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger, LoggerDecorator } from '../logger';
import { SlashCommandSubcommandBuilder } from './slash-command-sub-command-builder';

export class SlashCommandBuilder extends DiscordSlashCommandBuilder {
  @LoggerDecorator()
  private logger!: Logger;

  private executeFn?: (interaction: CommandInteraction) => Promise<any>;

  private _enabled?: boolean;

  public get enabled() {
    return this._enabled;
  }

  public setEnabled(enabled: boolean): this {
    this._enabled = enabled;
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

  public addSubcommand(
    input:
      | SlashCommandSubcommandBuilder
      | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder),
  ) {
    const { options } = this;

    // First, assert options conditions - we cannot have more than 25 options
    // validateMaxOptionsLength(options);

    // Get the final result
    const result = typeof input === 'function' ? input(new SlashCommandSubcommandBuilder()) : input;

    // assertReturnOfBuilder(result, SlashCommandSubcommandBuilder);

    // Push it
    options.push(result);

    return this;
  }
}
