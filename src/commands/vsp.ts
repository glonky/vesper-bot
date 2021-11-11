import { hyperlink } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Container from 'typedi';
import { SlashCommandBuilder } from '../builders';
import { Config } from '../config';
import { CoinGeckoService, EtherscanService, VesperService } from '../services';

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
            contractAddress: config.vesper.vspTokenAddress,
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
            .setFooter(
              'CoinGecko',
              'https://lh6.googleusercontent.com/9uoJO8mZ-AqbrPpTNqnj-nv8ULUnfv6JjFQhVhP67wBcQ5_F5x3a4SOmEPgQSyec0rCd7YnkNal_D5_He8BT=w2880-h1592',
            )
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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('ratio')
        .setDescription('Shows the vVSP to VSP ratio.')
        .setExecute(async (interaction: CommandInteraction) => {
          await interaction.deferReply();

          const config = Container.get(Config);
          const tokenBalance = await Container.get(EtherscanService).getERC20TokenAccountBalanceForTokenContractAddress(
            {
              address: config.vesper.vvspTokenAddress,
              contractAddress: config.vesper.vspTokenAddress,
            },
          );

          const totalSupply = await Container.get(EtherscanService).getERC20TokenTotalSupplyByContractAddress(
            config.vesper.vspTokenAddress,
          );

          const x = tokenBalance.result.dividedBy(totalSupply.result);
          const y = totalSupply.result.dividedBy(tokenBalance.result);

          const messageEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('VSP Ratio')
            .setDescription('vVSP to VSP Ratio')
            .setThumbnail('https://cdn-images-1.medium.com/fit/c/72/72/1*AjnJwyVg_kQs4kdf-PlXPQ.png')
            .addFields(
              {
                inline: true,
                name: 'VSP to vVSP',
                value: `1 VSP = ${x.toFixed(4)} vVSP`,
              },
              {
                inline: true,
                name: 'vVSP to VSP',
                value: `1 vVSP = ${y.toFixed(4)} VSP`,
              },
            )
            .setFooter('Etherscan', 'https://etherscan.io/images/brandassets/etherscan-logo-light-circle.png')
            .setTimestamp();

          await interaction.editReply({ embeds: [messageEmbed] });
        }),
    ),
};
