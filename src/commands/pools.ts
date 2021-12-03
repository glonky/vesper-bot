import { hyperlink } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Container from 'typedi';
import { SlashCommandBuilder } from '../builders';
import { Config } from '../config';
import { VesperService } from '../services';

export default {
  data: new SlashCommandBuilder()
    .setName('pools')
    .setEnabled(!Container.get(Config).isProduction)
    .setDescription(`Vesper pools Utilities`)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stats')
        .setDescription('Shows stats about pools.')
        .setExecute(async (interaction: CommandInteraction) => {
          await interaction.deferReply();

          const vspDashboards = await Container.get(VesperService).getDashboards();
          const valuesLocked = await Container.get(VesperService).getValuesLocked();

          // valuesLocked[0].valuesLocked.find((value) => value);
          const currencyFormatter = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' });

          const messageEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Pools')
            .setDescription('All pools on Vesper')
            .setThumbnail('https://cdn-images-1.medium.com/fit/c/72/72/1*AjnJwyVg_kQs4kdf-PlXPQ.png')
            .setFooter('Etherscan', 'https://etherscan.io/images/brandassets/etherscan-logo-light-circle.png')
            .setTimestamp();

          vspDashboards
            .filter((dashboard) => dashboard.status === 'operative' && dashboard.stage === 'prod')
            .forEach((dashboard) => {
              messageEmbed.addFields(
                {
                  inline: true,
                  name: 'Name',
                  value: hyperlink(dashboard.name, `https://app.vesper.finance/eth/${dashboard.contract.address}`),
                },
                {
                  inline: true,
                  name: 'Earning Rate',
                  value: currencyFormatter.format(5),
                },
                // {
                //   inline: true,
                //   name: 'Risk Level',
                //   value: dashboard.riskLevel.toString(),
                // },
                // {
                //   inline: true,
                //   name: 'Risk Level',
                //   value: dashboard.riskLevel.toString(),
                // },
              );
            });
          await interaction.editReply({ embeds: [messageEmbed] });
        }),
    ),
};
