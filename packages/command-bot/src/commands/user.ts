import { CommandInteraction, CustomSlashCommandBuilder } from '@vesper-discord/discord-service';
import Container from 'typedi';
import { Config } from '../config';

export default {
  data: new CustomSlashCommandBuilder()
    .setName('user')
    .setDescription('Replies with user info!')
    .setEnabled(!Container.get(Config).isProduction)
    .setExecute(async (interaction: CommandInteraction) => {
      await interaction.reply({
        content: ` Your id: ${interaction.user.id}`,
        ephemeral: true,
      });
    }),
};
