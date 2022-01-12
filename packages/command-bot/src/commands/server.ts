import { CustomSlashCommandBuilder, CommandInteraction } from '@vesper-discord/discord-service';
import Container from 'typedi';
import { Config } from '../config';

export default {
  data: new CustomSlashCommandBuilder()
    .setName('server')
    .setDescription('Replies with server info!')
    .setEnabled(!Container.get(Config).isProduction)
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
