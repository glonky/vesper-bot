import { CommandInteraction } from 'discord.js';
import Container from 'typedi';
import { SlashCommandBuilder } from '../builders';
import { Config } from '../config';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .setDisabled(Container.get(Config).isProduction)
    .setExecute(async (interaction: CommandInteraction) => {
      await interaction.reply({ content: 'Pong!', ephemeral: true });
    }),
};
