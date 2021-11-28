import { Interaction } from 'discord.js';
import Container from 'typedi';
import { RateLimiter } from '../rate-limiter';
import { SlashCommandSubcommandBuilder } from '../builders';
import { ExtendedClient } from '../interfaces';
import { Logger } from '../logger';
import { assertion } from '../errors';

export default {
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    assertion('channel must be defined on interaction', interaction.channel);

    Container.get(Logger).debug(`${interaction.user.tag} in #${interaction.channel.id} triggered an interaction.`);

    let commandName = interaction.commandName;

    if (interaction.options.getSubcommand(false)) {
      commandName = `${interaction.commandName}.${interaction.options.getSubcommand()}`;
    }

    const command = (interaction.client as ExtendedClient).commands.get(commandName);

    if (!command || !(command.data.enabled ?? true)) {
      return;
    }

    const subCommand = (command.data.options as SlashCommandSubcommandBuilder[]).find(
      (option: SlashCommandSubcommandBuilder) => option.name === interaction.options.getSubcommand(),
    );

    if (subCommand && !(subCommand.enabled ?? true)) {
      return;
    }

    if (
      command.data.restrictToChannels?.includes(interaction.channel.id) &&
      subCommand?.restrictToChannels === undefined
    ) {
      await interaction.reply({ content: 'This command is not available in this channel.', ephemeral: true });
      return;
    }

    const rateLimiter = Container.get(RateLimiter);

    if (command.data.rateLimit !== undefined && subCommand?.rateLimit === undefined) {
      const shouldRateLimitCommand = await rateLimiter.shouldRateLimitCommand({
        channelId: interaction.channel.id,
        commandId: interaction.commandId,
        userId: interaction.user.id,
      });

      if (shouldRateLimitCommand) {
        await interaction.reply({
          content: `You can only call this command once every ${command.data.rateLimit} seconds. Please wait to call it again.`,
          ephemeral: true,
        });

        return;
      }
    }

    try {
      if (subCommand) {
        if (subCommand.restrictToChannels?.includes(interaction.channel.id)) {
          await interaction.reply({ content: 'This command is not available in this channel.', ephemeral: true });
        } else {
          if (subCommand.rateLimit !== undefined) {
            const shouldRateLimitCommand = await rateLimiter.shouldRateLimitCommand({
              channelId: interaction.channel.id,
              commandId: interaction.commandId,
              userId: interaction.user.id,
            });

            if (shouldRateLimitCommand) {
              await interaction.reply({
                content: `You can only call this command once every ${subCommand.rateLimit} seconds. Please wait to call it again.`,
                ephemeral: true,
              });
              return;
            }
          }

          await subCommand.execute(interaction);
        }
      } else {
        await command.data.execute(interaction);
      }

      await rateLimiter.setCommandLastUsed({
        channelId: interaction.channel.id,
        commandId: interaction.commandId,
        ttl: subCommand?.rateLimit ?? command.data.rateLimit,
        userId: interaction.user.id,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
  name: 'interactionCreate',
};
