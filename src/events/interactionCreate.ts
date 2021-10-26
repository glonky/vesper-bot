import { Interaction } from 'discord.js';
import Container from 'typedi';
import { SlashCommandSubcommandBuilder } from '../builders';
import { ExtendedClient } from '../interfaces';
import { Logger } from '../logger';

export default {
  async execute(interaction: Interaction) {
    Container.get(Logger).info(
      `${interaction.user.tag} in #${(interaction.channel as any)?.name} triggered an interaction.`,
    );

    if (!interaction.isCommand()) return;

    let commandName = interaction.commandName;

    if (interaction.options.getSubcommand(false)) {
      commandName = `${interaction.commandName}.${interaction.options.getSubcommand()}`;
    }

    const command = (interaction.client as ExtendedClient).commands.get(commandName);

    if (!command || command.data.disabled) {
      return;
    }

    const subCommand = (command.data.options as SlashCommandSubcommandBuilder[]).find(
      (option: SlashCommandSubcommandBuilder) => option.name === interaction.options.getSubcommand(),
    );

    if (subCommand && subCommand.disabled) {
      return;
    }

    try {
      if (subCommand) {
        await subCommand.execute(interaction);
      } else {
        await command.data.execute(interaction);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
  name: 'interactionCreate',
};
