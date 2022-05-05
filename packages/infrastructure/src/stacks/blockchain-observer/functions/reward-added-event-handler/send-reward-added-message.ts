import { PoolRewardEventRepository } from '@vesper-discord/entity-service';
import { Logger } from '@vesper-discord/logger';
import { convert } from 'convert-svg-to-jpeg';
import { capitalize } from 'lodash';
import { DateTime } from 'luxon';
import fetch, { Headers } from 'node-fetch';
import FormData from 'form-data';
import { ContainerInstance } from 'typedi';

interface PoolRewardEvent {
  GSI2pk: string;
  poolLogoURI: string;
  poolHolders: {
    value: number;
  };
  poolType: string;

  poolInterestFee: {
    value: number;
  };
  poolWithdrawFee: {
    value: number;
  };
  GSI2ssk: string;
  baseTokenAddress: string;
  baseTokenAmount: {
    value: number;
  };
  baseTokenAmountInUSD: {
    value: number;
  };
  baseTokenName: string;
  baseTokenPriceInUSD: {
    value: number;
  };
  baseTokenSymbol: string;
  baseTokenTotalValueLocked: {
    value: number;
  };
  baseTokenTotalValueLockedInUSD: {
    value: number;
  };
  baseTokenValue: {
    value: number;
  };
  blockId: {
    value: number;
  };
  blockTimestamp: {
    value: number;
  };
  blockchain: string;
  id: string;
  network: string;
  pk: string;
  poolName: string;
  poolProxyContractAddress: string;
  poolRewardsProxyContractAddress: string;
  rewardAmount: {
    value: number;
  };
  rewardDuration: {
    value: number;
  };
  rewardTokenPoolAddress: string;
  rewardTokenPoolName: string;
  rewardTokenSymbol: string;
  sk: string;
  strategyAddress: string;
  strategyName: string;
  transactionId: string;
  type: 'POOL_REWARD_EVENT';
}

export interface SendRewardAddedMessageProps {
  poolRewardEvent: PoolRewardEvent;
  container: ContainerInstance;
}

export async function sendRewardAddedMessage({ poolRewardEvent, container }: SendRewardAddedMessageProps) {
  const logger = container.get(Logger);
  const currencyFormatter = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' });
  const numberFormatter = new Intl.NumberFormat('en-US');
  const tokenNumberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 5,
  });
  const percentFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'percent',
  });

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
    .getPoolRewardEventsByPool(poolRewardEvent.poolName);

  const [, lastPoolRewardEvent] = poolRewardEventsByPool as any;
  const percentDifferenceInYield =
    (Number(poolRewardEvent.baseTokenAmountInUSD.value) - Number(lastPoolRewardEvent.baseTokenAmountInUSD.value)) /
    Number(poolRewardEvent.baseTokenAmountInUSD.value);

  const percentDifferenceInTVL =
    (Number(poolRewardEvent.baseTokenTotalValueLockedInUSD.value) -
      Number(lastPoolRewardEvent.baseTokenTotalValueLockedInUSD.value)) /
    Number(poolRewardEvent.baseTokenTotalValueLockedInUSD.value);

  let vesperAppLink = 'https://app.vesper.finance/';

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
        name: 'Yield Amount USD',
        value: currencyFormatter.format(Number(poolRewardEvent.baseTokenAmountInUSD.value)),
      },
      {
        inline: true,
        name: 'Yield Amount Token',
        value: `${tokenNumberFormatter.format(Number(poolRewardEvent.baseTokenAmount.value))} ${
          poolRewardEvent.baseTokenSymbol
        }`,
      },
      {
        inline: true,
        name: 'TVL',
        value: currencyFormatter.format(Number(poolRewardEvent.baseTokenTotalValueLockedInUSD.value)),
      },

      {
        inline: true,
        name: 'Last Yield USD',
        value: currencyFormatter.format(Number(lastPoolRewardEvent.baseTokenAmountInUSD.value)),
      },
      {
        inline: true,
        name: 'Last Yield Token',
        value: `${tokenNumberFormatter.format(Number(lastPoolRewardEvent.baseTokenAmount.value))} ${
          lastPoolRewardEvent.baseTokenSymbol
        }`,
      },
      {
        inline: true,
        name: 'Last TVL',
        value: currencyFormatter.format(Number(lastPoolRewardEvent.baseTokenTotalValueLockedInUSD.value)),
      },
      {
        inline: true,
        name: 'Yield Difference',
        value: percentFormatter.format(percentDifferenceInYield),
      },
      {
        inline: true,
        name: 'TVL Difference',
        value: percentFormatter.format(percentDifferenceInTVL),
      },
      {
        inline: true,
        name: 'Last Rebalance',
        value: `[${DateTime.fromSeconds(
          Number(lastPoolRewardEvent.blockTimestamp.value),
        ).toRelative()}](https://etherscan.io/tx/${lastPoolRewardEvent.transactionId})`,
      },
      {
        inline: true,
        name: 'Pool',
        value: `[${poolRewardEvent.poolName}](${vesperAppLink})`,
      },
      {
        inline: true,
        name: 'Strategy',
        value: `[${poolRewardEvent.strategyName}](https://etherscan.io/address/${poolRewardEvent.strategyAddress})`,
      },
      {
        inline: true,
        name: 'Pool Holders',
        value: numberFormatter.format(Number(poolRewardEvent.poolHolders.value)),
      },
    ],
    footer: {
      icon_url: networkImageUrl,
      text: capitalize(poolRewardEvent.network),
    },
    thumbnail: {
      // url: poolRewardEvent.poolLogoURI,
      url: `attachment://thumbnail.jpg`,
    },
    timestamp: DateTime.fromSeconds(Number(poolRewardEvent.blockTimestamp.value)).toISO(),
    title: `🎉💰 Rebalance ${poolRewardEvent.poolName}`,
    url: 'https://etherscan.io/tx/${poolRewardEvent.transactionId}',
  };

  const channelId = '900091874973483109';
  const token = process.env.COMMAND_BOT_DISCORD_TOKEN;

  const formData = new FormData();
  const svg = await fetch(poolRewardEvent.poolLogoURI).then((res) => res.text());
  const jpg = await convert(svg, {
    height: 512,
    width: 512,
  });
  // const jpgFile = new File([jpg], 'thumbnail.jpg', { type: 'image/jpeg' });

  const stringifiedMessageEmbed = JSON.stringify({ embeds: [messageEmbed] });

  formData.append('payload_json', stringifiedMessageEmbed);
  formData.append('files[0]', jpg, 'thumbnail.jpg');

  const headers = new Headers();
  headers.append('Authorization', `Bot ${token}`);

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
