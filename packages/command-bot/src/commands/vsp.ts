import { chain } from 'lodash';
import Container from 'typedi';
import { Logger } from '@vesper-discord/logger';
import { unwrap } from '@vesper-discord/utils';
import { Config as VesperConfig, VesperService } from '@vesper-discord/vesper-service';
import { EtherscanService } from '@vesper-discord/etherscan-service';
import { CoinGeckoService } from '@vesper-discord/coin-gecko-service';
import { CustomSlashCommandBuilder, hyperlink, MessageEmbed } from '@vesper-discord/discord-service';
import { Config } from '../config';

export default {
  data: new CustomSlashCommandBuilder()
    .setName('vsp')
    .setDescription(`VSP utilities`)
    .addCustomSubcommand((subcommand) =>
      subcommand
        .setName('price')
        .setRestrictToChannels([
          '916119936697507841', //price-and-trading
        ])
        .setDescription('Current price of VSP on different exchanges.')
        .setExecute(async ({ interaction }) => {
          await interaction.deferReply();

          const config = Container.get(VesperConfig);
          const stats = await Container.get(VesperService).getVspStats();
          const coinInfo = await Container.get(CoinGeckoService).getCoinInfoFromContractAddress({
            coinId: 'ethereum',
            contractAddress: config.vspTokenAddress,
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

          Container.get(Logger).info('tickers', { tickers: coinInfo.tickers });
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
    .addCustomSubcommand((subcommand) =>
      subcommand
        .setName('exchange-rate')
        .setDescription('Shows the vVSP to VSP exchange rate.')
        .setRestrictToChannels([
          '916119936697507841', //price-and-trading
          '916122090183208990', // defi-lending-strategies
        ])
        .setExecute(async ({ interaction }) => {
          await interaction.deferReply();

          const config = Container.get(VesperConfig);
          const vspQuantityInVVSPPool = await Container.get(
            EtherscanService,
          ).getERC20TokenAccountBalanceForTokenContractAddress({
            address: config.vvspTokenAddress,
            contractAddress: config.vspTokenAddress,
          });

          const vvspTotalSupply = await Container.get(EtherscanService).getERC20TokenTotalSupplyByContractAddress(
            config.vvspTokenAddress,
          );

          const vvspToVSPRatio = vspQuantityInVVSPPool.result.dividedBy(vvspTotalSupply.result);
          const vspToVVSPRatio = vvspTotalSupply.result.dividedBy(vspQuantityInVVSPPool.result);

          const messageEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('VSP / vVSP Exchange Rate')
            .setDescription(
              unwrap`
              1 VSP = ${vspToVVSPRatio.toFixed(3)} vVSP
              1 vVSP = ${vvspToVSPRatio.toFixed(3)} VSP
            `,
            )
            .setThumbnail('https://cdn-images-1.medium.com/fit/c/72/72/1*AjnJwyVg_kQs4kdf-PlXPQ.png');

          await interaction.editReply({ embeds: [messageEmbed] });
        }),
    )
    .addCustomSubcommand((subcommand) =>
      subcommand
        .setName('stats')
        .setEnabled(!Container.get(Config).isProduction)
        .setDescription('Shows the VSP stats.')
        .setExecute(async ({ interaction }) => {
          await interaction.deferReply();

          const vspStats = await Container.get(VesperService).getVspStats();

          const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent' });
          const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, style: 'decimal' });
          const fractionalCurrencyFormatter = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' });
          const currencyFormatter = new Intl.NumberFormat('en-US', {
            currency: 'USD',
            maximumFractionDigits: 0,
            style: 'currency',
          });

          const messageEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('VSP Stats')
            .setDescription('VSP stats from the Vesper App')
            .addFields([
              { inline: true, name: 'Price', value: fractionalCurrencyFormatter.format(vspStats.price) },
              {
                inline: true,
                name: 'Price Change 1 hour',
                value: fractionalCurrencyFormatter.format(vspStats.priceChange1h),
              },
              {
                inline: true,
                name: 'Price Delta 1 hour',
                value: fractionalCurrencyFormatter.format(vspStats.priceDelta1h),
              },
            ])
            .addFields([
              {
                inline: true,
                name: 'Total Supply',
                value: `${numberFormatter.format(vspStats.totalSupply.toNumber())} VSP`,
              },
              {
                inline: true,
                name: 'Circulating Supply',
                value: `${numberFormatter.format(vspStats.circulatingSupply.toNumber())} VSP`,
              },
              {
                inline: true,
                name: 'Supply Ratio',
                value: percentFormatter.format(vspStats.circulatingSupply.dividedBy(vspStats.totalSupply).toNumber()),
              },
              { inline: true, name: 'Market Cap', value: currencyFormatter.format(vspStats.marketCap) },
            ])
            .addFields([
              {
                inline: true,
                name: 'VSP Distributed 24 Hours',
                value: numberFormatter.format(vspStats.vspDistributed.toNumber()),
              },
              {
                inline: true,
                name: 'vVSP Flow 30 Days',
                value: numberFormatter.format(vspStats.vspDistributed30d.toNumber()),
              },
            ])
            .setThumbnail('https://cdn-images-1.medium.com/fit/c/72/72/1*AjnJwyVg_kQs4kdf-PlXPQ.png');

          await interaction.editReply({ embeds: [messageEmbed] });
        }),
    )
    .addCustomSubcommand((subcommand) =>
      subcommand
        .setName('loan-rates')
        .setEnabled(!Container.get(Config).isProduction)
        .setDescription('Shows the loan rates.')
        .setExecute(async ({ interaction }) => {
          await interaction.deferReply();

          const loanRates = await Container.get(VesperService).getLoanRates();

          const percentFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3, style: 'percent' });

          const chunkedLendRates = chain(loanRates.lendRates).orderBy('apy', 'desc').chunk(8).value();
          const lendRates = chain(loanRates.lendRates).orderBy('apy', 'desc').value();

          await interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Vesper Loan Rates')
                .setDescription(
                  `
                Gets the APY, APR and token symbol from all pools over the last 24 hours.

                Symbol   |   APY   |   APR
                ---------|---------|---------
                ${lendRates
                  .map((lendRate) => {
                    return `${lendRate.tokenSymbol}   |   ${percentFormatter.format(
                      lendRate.apy,
                    )}   |   ${percentFormatter.format(lendRate.apr)}`;
                  })
                  .join('\n')}
                `,
                )
                .setThumbnail('https://cdn-images-1.medium.com/fit/c/72/72/1*AjnJwyVg_kQs4kdf-PlXPQ.png'),
            ],
          });

          // chunkedLendRates.forEach((lendRates) => {
          //   const messageEmbed = new MessageEmbed();

          //   lendRates.forEach((lendRate) => {
          //     messageEmbed.addFields(
          //       {
          //         inline: true,
          //         name: 'Symbol',
          //         value: lendRate.tokenSymbol,
          //       },
          //       {
          //         inline: true,
          //         name: 'APY',
          //         value: percentFormatter.format(lendRate.apy),
          //       },
          //       {
          //         inline: true,
          //         name: 'APR',
          //         value: percentFormatter.format(lendRate.apr),
          //       },
          //     );
          //   });

          //   interaction.channel?.send({ embeds: [messageEmbed] });
          // });
        }),
    ),
};
