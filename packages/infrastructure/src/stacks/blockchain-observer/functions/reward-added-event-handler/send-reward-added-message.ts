import { PoolRewardEventRepository } from '@vesper-discord/entity-service';
import sharp from 'sharp';
import { capitalize } from 'lodash';
import { DateTime } from 'luxon';
import fetch, { Headers } from 'node-fetch';
import FormData from 'form-data';
import { ContainerInstance } from 'typedi';
import { BigNumber, ethers } from 'ethers';

interface PoolRewardEvent {
  GSI2pk: string;
  GSI2sk: string;
  GSI3pk: string;
  GSI3sk: string;
  blockNumber: {
    value: number;
  };
  blockTimestamp: {
    value: number;
  };
  id: string;
  network: string;
  pk: string;
  poolAssetAddress: string;
  poolAssetCurrency: string;
  poolAssetDecimals: {
    value: number;
  };
  poolAssetPrice: {
    value: number;
  };
  poolAssetSymbol: string;
  poolAssetTotalValueLocked: {
    value: number;
  };
  poolContractVersion: string;
  poolHolders: {
    value: number;
  };
  poolInterestFee: {
    value: number;
  };
  poolLogoURI: string;
  poolName: string;
  poolProxyContractAddress: string;
  poolRewardsProxyContractAddress: string;
  poolRiskLevel: {
    value: number;
  };
  poolStage: string;
  poolTokenTotalValueLocked: string;
  poolTokenValue: {
    value: number;
  };
  poolType: string;
  poolWithdrawFee: {
    value: number;
  };
  rewardAmount: {
    value: number;
  };
  rewardDuration: {
    value: number;
  };
  rewardTokenAmount: string;
  rewardTokenAmountInUSD: {
    value: number;
  };
  rewardTokenPoolDecimals: {
    value: number;
  };
  poolTotalValueLocked: string;
  rewardTokenPoolAddress: string;
  rewardTokenPoolName: string;
  poolFullName: string;
  rewardTokenPriceInUSD: {
    value: number;
  };
  rewardTokenSymbol: string;
  sk: string;
  strategyAddress: string;
  strategyName: string;
  transactionHash: string;
  type: 'POOL_REWARD_EVENT';
}

export interface SendRewardAddedMessageProps {
  poolRewardEvent: PoolRewardEvent;
  container: ContainerInstance;
}

export async function sendRewardAddedMessage({ poolRewardEvent, container }: SendRewardAddedMessageProps) {
  // const logger = container.get(Logger);
  const currencyFormatter = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' });
  // const numberFormatter = new Intl.NumberFormat('en-US');
  const tokenNumberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 5,
  });
  // const percentFormatter = new Intl.NumberFormat('en-US', {
  //   maximumFractionDigits: 2,
  //   minimumFractionDigits: 2,
  //   style: 'percent',
  // });

  let networkImageUrl = '';

  switch (poolRewardEvent.network) {
    case 'mainnet':
      networkImageUrl = 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=022';
      break;
    case 'avalanche':
      networkImageUrl = 'https://cryptologos.cc/logos/avalanche-avax-logo.png?v=022';
      break;
    case 'polygon':
      networkImageUrl = 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=022';
      break;
  }

  const poolRewardEventsByPool = await container
    .get(PoolRewardEventRepository)
    .getPoolRewardEventsByPool({ poolContractAddress: poolRewardEvent.poolProxyContractAddress });

  let lastPoolRewardEvent: PoolRewardEvent | undefined;

  if (poolRewardEventsByPool.length > 1) {
    lastPoolRewardEvent = poolRewardEventsByPool[1] as unknown as PoolRewardEvent;
  }
  // const percentDifferenceInYield =
  //   (Number(poolRewardEvent.rewardTokenAmountInUSD.value) - Number(lastPoolRewardEvent.rewardTokenAmountInUSD.value)) /
  //   Number(poolRewardEvent.rewardTokenAmountInUSD.value);

  // const percentDifferenceInTVL =
  //   (Number(poolRewardEvent.rewardTokenTotalValueLockedInUSD.value) -
  //     Number(lastPoolRewardEvent.rewardTokenTotalValueLockedInUSD.value)) /
  //   Number(poolRewardEvent.rewardTokenTotalValueLockedInUSD.value);

  let vesperAppLink;

  switch (poolRewardEvent.poolStage) {
    case 'orbit': {
      vesperAppLink = 'https://orbit.vesper.finance/';
      break;
    }
    default: {
      vesperAppLink = 'https://app.vesper.finance/';
    }
  }

  switch (poolRewardEvent.network) {
    case 'mainnet':
      vesperAppLink += 'eth/';
      break;
    case 'avalanche':
      vesperAppLink += 'avalanche/';
      break;
    case 'polygon':
      vesperAppLink += 'polygon/';
      break;
    default:
      throw new Error(`Unknown network: ${poolRewardEvent.network}`);
  }

  vesperAppLink += `pools/${poolRewardEvent.poolProxyContractAddress}`;

  const convertedPoolTokenTotalValueLocked = ethers.utils.formatUnits(
    BigNumber.from(poolRewardEvent.poolTotalValueLocked),
    Number(poolRewardEvent.poolAssetDecimals.value),
  );

  const poolTokenTotalValueLockedInUSD =
    Number(convertedPoolTokenTotalValueLocked) * Number(poolRewardEvent.poolAssetPrice.value);

  const rewardAmountFormatted = ethers.utils.formatUnits(
    BigNumber.from(poolRewardEvent.rewardTokenAmount),
    Number(poolRewardEvent.rewardTokenPoolDecimals.value),
  );

  const messageEmbed = {
    attachments: [
      {
        description: 'Thumbnail',
        filename: 'thumbnail.jpg',
        id: 0,
      },
    ],
    fields: [
      {
        inline: true,
        name: 'Yield',
        value: `${tokenNumberFormatter.format(Number(rewardAmountFormatted))} ${poolRewardEvent.rewardTokenSymbol}`,
      },
      {
        inline: true,
        name: 'USD Value',
        value: currencyFormatter.format(Number(poolRewardEvent.rewardTokenAmountInUSD.value)),
      },
      {
        inline: true,
        name: 'TVL',
        value: currencyFormatter.format(poolTokenTotalValueLockedInUSD),
      },

      // {
      //   inline: true,
      //   name: 'Last Yield USD',
      //   value: currencyFormatter.format(Number(lastPoolRewardEvent.rewardTokenAmountInUSD.value)),
      // },
      // {
      //   inline: true,
      //   name: 'Last Yield Token',
      //   value: `${tokenNumberFormatter.format(Number(lastPoolRewardEvent.rewardTokenAmount.value))} ${
      //     lastPoolRewardEvent.rewardTokenSymbol
      //   }`,
      // },
      // {
      //   inline: true,
      //   name: 'Last TVL',
      //   value: currencyFormatter.format(Number(lastPoolRewardEvent.rewardTokenTotalValueLockedInUSD.value)),
      // },
      // {
      //   inline: true,
      //   name: 'Yield Difference',
      //   value: percentFormatter.format(percentDifferenceInYield),
      // },
      // {
      //   inline: true,
      //   name: 'TVL Difference',
      //   value: percentFormatter.format(percentDifferenceInTVL),
      // },
      ...(lastPoolRewardEvent
        ? [
            {
              inline: true,
              name: 'Last Rebalance',
              value: `[${DateTime.fromMillis(
                Number(lastPoolRewardEvent.blockTimestamp.value),
              ).toRelative()}](https://etherscan.io/tx/${lastPoolRewardEvent.transactionHash})`,
            },
          ]
        : []),
      {
        inline: true,
        name: 'Pool',
        value: `[${poolRewardEvent.poolFullName}](${vesperAppLink})`,
      },
      // {
      //   inline: true,
      //   name: 'Strategy',
      //   value: `[${poolRewardEvent.strategyName}](https://etherscan.io/address/${poolRewardEvent.strategyAddress})`,
      // },
      // {
      //   inline: true,
      //   name: 'Pool Holders',
      //   value: numberFormatter.format(Number(poolRewardEvent.poolHolders.value)),
      // },
      ...(poolRewardEvent.poolType === 'grow'
        ? [
            {
              inline: true,
              name: 'Risk Level',
              value: poolRewardEvent.poolRiskLevel.value === 4 ? 'Aggressive' : 'Conservative',
            },
          ]
        : []),
    ],
    footer: {
      icon_url: networkImageUrl,
      text: capitalize(poolRewardEvent.network),
    },
    thumbnail: {
      url: `attachment://thumbnail.jpg`,
    },
    timestamp: DateTime.fromMillis(Number(poolRewardEvent.blockTimestamp.value)).toISO(),
    title: `🎉💰 ${poolRewardEvent.poolName} Rebalance`,
    url: `https://etherscan.io/tx/${poolRewardEvent.transactionHash}`,
  };

  // TODO: Add risk level to grow pools

  const channelId = '900091874973483109';
  const token = process.env.COMMAND_BOT_DISCORD_TOKEN;

  const formData = new FormData();
  const svg = await fetch(poolRewardEvent.poolLogoURI).then((res) => res.text());
  const jpg = await sharp(Buffer.from(svg)).resize(200, 200).toBuffer();

  const stringifiedMessageEmbed = JSON.stringify({ embeds: [messageEmbed] });

  formData.append('payload_json', stringifiedMessageEmbed);
  formData.append('files[0]', jpg, 'thumbnail.jpg');

  const headers = new Headers();
  headers.append('Authorization', `Bot ${token}`);

  // TODO: Replace node-fetch with axios
  const result = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
    body: formData,
    headers,
    method: 'POST',
  });

  const jsonResult = await result.json();

  if (!result.ok) {
    throw new Error(`Failed to send message to Discord: ${result.statusText} ${JSON.stringify(jsonResult)}`);
  }

  return jsonResult;
}
