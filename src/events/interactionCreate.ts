import { Interaction } from 'discord.js';
import Container from 'typedi';
import { RateLimiter } from '../rate-limiter';
import { SlashCommandSubcommandBuilder } from '../builders';
import { Logger } from '../logger';
import { assertion } from '../errors';
import { DiscordService } from '../services';

export default {
  async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    assertion('channel must be defined on interaction', interaction.channel);
    const logger = Container.get(Logger);

    logger.debug(`${interaction.user.tag} in #${interaction.channel.id} triggered an interaction.`);

    let commandName = interaction.commandName;

    if (interaction.options.getSubcommand(false)) {
      commandName = `${interaction.commandName}.${interaction.options.getSubcommand()}`;
    }

    const discordService = Container.get(DiscordService);
    const command = discordService.commands.get(commandName);

    if (!command || !(command.data.enabled ?? true)) {
      return;
    }

    const subCommand = (command.data.options as SlashCommandSubcommandBuilder[]).find(
      (option: SlashCommandSubcommandBuilder) => option.name === interaction.options.getSubcommand(),
    );

    if (subCommand && !(subCommand.enabled ?? true)) {
      return;
    }

    const restrictedChannels = [
      ...(discordService.restrictToChannels ?? []),
      ...(command.data.restrictToChannels ?? []),
      ...(subCommand?.restrictToChannels ?? []),
    ];

    if (!restrictedChannels.includes(interaction.channel.id)) {
      await interaction.reply({ content: 'This command is not available in this channel.', ephemeral: true });
      return;
    }

    const rateLimiter = Container.get(RateLimiter);
    const rateLimit = subCommand?.rateLimit ?? command.data.rateLimit ?? discordService.rateLimit;

    if (rateLimit !== undefined) {
      const shouldRateLimitCommand = await rateLimiter.shouldRateLimitCommand({
        channelId: interaction.channel.id,
        commandId: interaction.commandId,
        userId: interaction.user.id,
      });

      if (shouldRateLimitCommand) {
        await interaction.reply({
          content: `You can only call this command once every ${rateLimit} seconds. Please wait to call it again.`,
          ephemeral: true,
        });

        return;
      }
    }

    try {
      if (subCommand) {
        await subCommand.execute(interaction);
      } else {
        await command.data.execute(interaction);
      }

      await rateLimiter.setCommandLastUsed({
        channelId: interaction.channel.id,
        commandId: interaction.commandId,
        ttl: rateLimit,
        userId: interaction.user.id,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
  name: 'interactionCreate',
};
