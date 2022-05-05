import { CustomSlashCommandBuilder } from '@vesper-discord/discord-service';
import { Container } from 'typedi';
import { Config } from '../config';

export default {
  data: new CustomSlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .setEnabled(!Container.get(Config).isProduction)
    .setExecute(async ({ interaction }) => {
      await interaction.reply({ content: 'Pong!', ephemeral: true });
    }),
};
