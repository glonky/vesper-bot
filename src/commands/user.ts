import { CommandInteraction } from 'discord.js';
import Container from 'typedi';
import { SlashCommandBuilder } from '../builders';
import { Config } from '../config';

export default {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info!')
    .setDisabled(Container.get(Config).isProduction)
    .setExecute(async (interaction: CommandInteraction) => {
      await interaction.reply({
        content: ` Your id: ${interaction.user.id}`,
        ephemeral: true,
      });
    }),
};
