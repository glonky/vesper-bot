import { Interaction } from 'discord.js';
import Container from 'typedi';
import { Logger } from '../logger';

export default {
  execute(interaction: Interaction) {
    Container.get(Logger).info(
      `${interaction.user.tag} in #${(interaction.channel as any)?.name} triggered an interaction.`,
    );
  },
  name: 'interactionCreate',
};
