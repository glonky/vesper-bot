import { Interaction } from 'discord.js';
import Container from 'typedi';
import { ExtendedClient } from '../interfaces';
import { Logger } from '../logger';

export default {
  async execute(interaction: Interaction) {
    Container.get(Logger).info(
      `${interaction.user.tag} in #${(interaction.channel as any)?.name} triggered an interaction.`,
    );

    if (!interaction.isCommand()) return;

    const command = (interaction.client as ExtendedClient).commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
  name: 'interactionCreate',
};
