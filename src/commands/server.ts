import { CommandInteraction } from 'discord.js';
import Container from 'typedi';
import { SlashCommandBuilder } from '..//builders';
import { Config } from '../config';

export default {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Replies with server info!')
    .setDisabled(Container.get(Config).isProduction)
    .setExecute(async (interaction: CommandInteraction) => {
      await interaction.reply({
        content: `
        Server name: ${interaction.guild?.name}
        Total members: ${interaction.guild?.memberCount}
        Verification Level: ${interaction.guild?.verificationLevel}
        Created At: ${interaction.guild?.createdAt}
      `,
        ephemeral: true,
      });
    }),
};
