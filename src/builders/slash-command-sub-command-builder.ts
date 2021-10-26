import { SlashCommandSubcommandBuilder as DiscordSlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger, LoggerDecorator } from '../logger';

export class SlashCommandSubcommandBuilder extends DiscordSlashCommandSubcommandBuilder {
  @LoggerDecorator()
  private logger!: Logger;

  private executeFn?: (interaction: CommandInteraction) => Promise<any>;

  private _disabled?: boolean;

  public get disabled() {
    return this._disabled;
  }

  public setDisabled(disabled: boolean): this {
    this._disabled = disabled;
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
