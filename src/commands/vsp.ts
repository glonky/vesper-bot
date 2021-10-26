import { hyperlink } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Container from 'typedi';
import { SlashCommandBuilder } from '../builders';
import { Config } from '../config';
import { CoinGeckoService, VesperService } from '../services';

export default {
  data: new SlashCommandBuilder()
    .setName('vsp')
    .setDescription(`VSP utilities`)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('price')
        .setDescription('Current price of VSP on different exchanges.')
        .setExecute(async (interaction: CommandInteraction) => {
          await interaction.deferReply();

          const config = Container.get(Config);
          const stats = await Container.get(VesperService).getVspStats();
          const coinInfo = await Container.get(CoinGeckoService).getCoinInfoFromContractAddress({
            coinId: 'ethereum',
            contractAddress: config.vesper.contractAddress,
          });
          const numberFormatter = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' });

          const messageEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('VSP Price')
            .setDescription('Current price of VSP on different exchanges.')
            .setThumbnail('https://cdn-images-1.medium.com/fit/c/72/72/1*AjnJwyVg_kQs4kdf-PlXPQ.png')
            .addFields({
              inline: true,
              name: 'Vesper',
              value: hyperlink(
                numberFormatter.format(stats.price),
                'https://app.vesper.finance/eth/0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc',
              ),
            })
            .setTimestamp();

          coinInfo.tickers.forEach((ticker) => {
            messageEmbed.addField(
              ticker.market.name,
              hyperlink(numberFormatter.format(ticker.converted_last.usd), ticker.trade_url),
              true,
            );
          });

          await interaction.editReply({ embeds: [messageEmbed] });
        }),
    ),
};
