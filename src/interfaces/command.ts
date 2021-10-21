import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction, PermissionFlags } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  permissions?: PermissionFlags[];
  execute(interaction: Interaction): Promise<void> | void;
}
