import { BlockchainScanService } from '@vesper-discord/blockchain-scan-service';
import { BlockchainService } from '@vesper-discord/blockchain-service';
import { ulid } from 'ulid';
import bluebird from 'bluebird';
import { CoinGeckoService, PlatformId } from '@vesper-discord/coin-gecko-service';
import { PoolRewardEventRepository } from '@vesper-discord/entity-service';
import { Logger, LoggerDecorator } from '@vesper-discord/logger';
import { Inject, Service } from 'typedi';
import { LogDescription } from 'ethers/lib/utils';
import { BigNumber, ethers } from 'ethers';
import { assertion, NotFoundError } from '@vesper-discord/errors';
import { DateTime } from 'luxon';
import { VesperService } from '../service';
import contracts3_0_23 from '../pools/releases/3.0.23/contracts.json';
import contracts4_0_1 from '../pools/releases/4.0.1/contracts.json';
import { Pool } from '../interfaces';

export interface BackfillProps {
  poolContractVersion?: 3 | 4;
  force?: boolean;
  fromBlockNumber?: number;
  toBlockNumber?: number;
  poolAddress?: string;
}

@Service()
export abstract class RewardAddedEventHandler {
  @LoggerDecorator()
  protected readonly logger!: Logger;

  @Inject(() => CoinGeckoService)
  private coinGeckoService!: CoinGeckoService;

  @Inject(() => PoolRewardEventRepository)
  private poolRewardEventRepository!: PoolRewardEventRepository;

  protected abstract readonly vesperService: VesperService;

  protected abstract readonly blockchainService: BlockchainService;

  protected abstract readonly blockchainScanService: BlockchainScanService;
  protected abstract get network(): string;
  protected abstract get coingeckoPlatformId(): PlatformId;

  public async backfill(props?: BackfillProps) {
    const poolContractVersion = props?.poolContractVersion === 3 ? '3.0.23' : '4.0.1';
    const poolContracts = (
      props?.poolContractVersion === 3 ? contracts3_0_23 : contracts4_0_1
    ) as typeof contracts4_0_1;

    const { networks } = poolContracts;

    const skippedBecauseRewardTokenIsVSP: any = [];
    const skippedBecauseRewardTokenMissing: any = [];
    const skippedBecauseCouldNotParseLog: any = [];
    const skippedBecauseCouldNotFindPool: any = [];
    const skippedBecauseCouldNotFindPriceData: any = [];

    const results = await bluebird.map(
      Object.entries(networks),
      async ([network, networkPools]) => {
        if (network !== this.network) return;

        return bluebird.map(
          Object.entries(networkPools),
          async ([_poolName, poolDefinition]) => {
            if (!poolDefinition.poolRewards) {
              return;
            }

            if (props?.poolAddress && poolDefinition.pool.proxy !== props.poolAddress) {
              return;
            }

            const vesperPools = await this.vesperService.getPools();
            const vesperPool = vesperPools.find((pool) => pool.address === poolDefinition.pool.proxy) as Pool;

            if (!vesperPool) {
              skippedBecauseCouldNotFindPool.push({
                poolAddress: poolDefinition.pool.proxy,
                poolContractVersion,
              });
              return;
            }

            const poolRewardsProxyContractAddress = poolDefinition.poolRewards.proxy;

            const poolRewardsProxyContract = await this.blockchainScanService.getContractFromAddress(
              poolRewardsProxyContractAddress,
            );

            const lastEthereumPoolRewardEvent = await this.poolRewardEventRepository.getPoolRewardEventsByPool({
              poolContractAddress: poolDefinition.pool.proxy,
              poolContractVersion,
            });

            let startingBlockNumber = 0;

            if (!props?.force && lastEthereumPoolRewardEvent.length > 0) {
              startingBlockNumber = Number((lastEthereumPoolRewardEvent[0] as any)?.blockNumber.value) + 1;
            }

            let fromBlock = startingBlockNumber;

            if (fromBlock === 0 && vesperPool.birthblock) {
              fromBlock = vesperPool.birthblock;
            }

            const filter = poolRewardsProxyContract.filters.RewardAdded();
            const latestBlockNumber = props?.toBlockNumber ?? (await this.blockchainService.getBlockNumber());
            const logs = await this.blockchainService.getLogs({
              ...filter,
              fromBlock: props?.fromBlockNumber ?? fromBlock,
              toBlock: latestBlockNumber,
            });

            const parsedLogs = await bluebird.map(
              logs,
              async (log) => {
                let parsedLog: LogDescription | undefined;

                try {
                  parsedLog = this.blockchainService.parseTransactionLog(poolRewardsProxyContract.interface, log);
                } catch (e) {
                  this.logger.error('error parsing log', { error: e as Error });
                  skippedBecauseCouldNotParseLog.push(log);
                  return null;
                }

                return {
                  ...log,
                  block: await this.blockchainService.getBlockInfo(log.blockNumber),
                  parsedLog,
                  transaction: await this.blockchainService.getTransaction(log.transactionHash),
                };
              },
              // { concurrency: 10 },
            );

            const filteredLogs = parsedLogs.filter(Boolean);

            const poolProxyContract = await this.blockchainScanService.getContractFromAddress(
              poolDefinition.pool.proxy,
            );

            const strategyAddresses = await this.blockchainService.callMethod({
              contract: poolProxyContract,
              methodName: 'getStrategies',
            });

            return bluebird.map(
              filteredLogs,
              async (rewardAddedEvent) => {
                const strategyAddress = strategyAddresses.find(
                  (address: string) => address === rewardAddedEvent?.transaction.to,
                );

                let strategyName;

                if (strategyAddress) {
                  const strategyContract = await this.blockchainScanService.getContractFromAddress(strategyAddress);

                  strategyName = await this.blockchainService.callMethod({
                    cache: {
                      ttl: 60 * 60 * 24 * 30,
                    },
                    contract: strategyContract,
                    methodName: 'NAME',
                  });
                }

                const poolContract = await this.blockchainScanService.getContractFromAddress(poolDefinition.pool.proxy);

                const poolName = await this.blockchainService.callMethod({
                  cache: {
                    ttl: 60 * 60 * 24 * 30,
                  },
                  contract: poolContract,
                  methodName: 'name',
                });

                const rewardTokenPoolAddress = rewardAddedEvent?.parsedLog.args?.rewardToken as string;

                if (!rewardTokenPoolAddress) {
                  skippedBecauseRewardTokenMissing.push({
                    args: rewardAddedEvent?.parsedLog.args,
                    poolAddress: poolDefinition.pool.proxy,
                    poolContractVersion,
                    poolName,
                  });
                  return;
                }

                const rewardTokenPoolContract = await this.blockchainScanService.getContractFromAddress(
                  rewardTokenPoolAddress,
                );

                let rewardTokenPoolName = await this.blockchainService.callMethod({
                  cache: {
                    ttl: 60 * 60 * 24 * 30,
                  },
                  contract: rewardTokenPoolContract,
                  methodName: 'name',
                });

                let rewardTokenAddress;

                if (typeof rewardTokenPoolContract.token === 'function') {
                  rewardTokenAddress = await rewardTokenPoolContract.token();
                } else {
                  rewardTokenAddress = rewardTokenPoolAddress;
                }

                const rewardTokenContract = await this.blockchainScanService.getContractFromAddress(rewardTokenAddress);

                const rewardTokenSymbol = await this.blockchainService.callMethod({
                  cache: {
                    ttl: 60 * 60 * 24 * 30,
                  },
                  contract: rewardTokenContract,
                  methodName: 'symbol',
                });
                const rewardTokenPoolDecimals = await this.blockchainService.callMethod({
                  cache: {
                    ttl: 60 * 60 * 24 * 30,
                  },
                  contract: rewardTokenPoolContract,
                  methodName: 'decimals',
                });

                if (rewardTokenSymbol === 'VSP') {
                  this.logger.debug('Skipping because of VSP');
                  skippedBecauseRewardTokenIsVSP.push({
                    poolAddress: poolDefinition.pool.proxy,
                    poolContractVersion,
                    poolName: vesperPool.poolName,
                    rewardTokenAddress,
                    rewardTokenSymbol,
                  });
                  rewardTokenPoolName = 'vVSP pool';
                }

                const rewardAmount = rewardAddedEvent?.parsedLog.args?.reward as BigNumber;

                const rewardDuration = rewardAddedEvent?.parsedLog.args?.rewardDuration?.toBigInt() ?? 0;

                let rewardTokenPriceInUSD;

                if (rewardTokenAddress === 'ETH') {
                  const coinInfo = await this.coinGeckoService.getCoin({ id: 'ethereum' });
                  rewardTokenPriceInUSD = Number(coinInfo.market_data.current_price.usd);
                } else {
                  const rewardTokenPrice = await this.coinGeckoService.getPriceOfToken({
                    contractAddresses: [rewardTokenAddress],
                    platformId: this.coingeckoPlatformId,
                    vsCurrencies: ['USD'],
                  });
                  const prices = Object.values(rewardTokenPrice);

                  if (prices.length === 0) {
                    rewardTokenPriceInUSD = 0;

                    skippedBecauseCouldNotFindPriceData.push({
                      poolAddress: poolDefinition.pool.proxy,
                      poolContractVersion,
                      poolName: vesperPool.poolName,
                      rewardTokenAddress,
                    });
                  } else {
                    rewardTokenPriceInUSD = Number(prices[0].usd);
                  }
                }

                const convertedTokenValue = ethers.utils.formatUnits(vesperPool.tokenValue, vesperPool.asset.decimals);
                const convertedRewardTokenAmount = ethers.utils.formatUnits(rewardAmount, rewardTokenPoolDecimals);

                const rewardTokenAmountInUSD =
                  Number(convertedRewardTokenAmount) * Number(convertedTokenValue) * rewardTokenPriceInUSD;

                // TODO:
                // Add holders, interest earned so far
                // TODO: Create snapshot of pool state at interval as well as snapshot of pool state at end of reward period
                // https://ethereum.stackexchange.com/questions/41684/api-to-gather-list-of-top-token-holders
                assertion('reward added event must be defined', rewardAddedEvent);

                const blockTimestamp = DateTime.fromSeconds(rewardAddedEvent?.block?.timestamp);

                let id = ulid(blockTimestamp.toMillis());
                const pk = `POOL#${poolDefinition.pool.proxy.toLowerCase()}`;
                const gsiSk4 = `BLOCK_NUMBER#${rewardAddedEvent.blockNumber}#TRANSACTION_HASH#${rewardAddedEvent.transactionHash}`;
                let createdAt = Date.now();
                let sk = `POOL_REWARD_EVENT#${id}`;

                const rewardEntity = {
                  GSI2pk: strategyName ? `POOL_STRATEGY#${strategyName}` : undefined,
                  GSI2sk: strategyName ? `POOL_REWARD_EVENT#${id}` : undefined,
                  GSI3pk: `NETWORK#${this.network}`,
                  GSI3sk: `POOL_REWARD_EVENT#${id}`,
                  GSI4pk: pk,
                  GSI4sk: gsiSk4,
                  blockNumber: rewardAddedEvent.blockNumber,
                  blockTimestamp: blockTimestamp.toMillis(),
                  createdAt,
                  entityType: 'POOL_REWARD_EVENT',
                  id,
                  network: this.network,
                  pk,
                  poolAssetAddress: vesperPool.asset.address,
                  poolAssetCurrency: vesperPool.asset.currency,
                  poolAssetDecimals: Number(vesperPool.asset.decimals),
                  poolAssetPrice: vesperPool.asset.price,
                  poolAssetSymbol: vesperPool.asset.symbol,
                  poolContractVersion,
                  poolFullName: poolName,
                  poolHolders: vesperPool.holders,
                  poolInterestFee: vesperPool.interestFee,
                  poolLogoURI: vesperPool.logoURI,
                  poolName: vesperPool.name,
                  poolProxyContractAddress: poolDefinition.pool.proxy,
                  poolRewardsProxyContractAddress,
                  poolRiskLevel: vesperPool.riskLevel,
                  poolStage: vesperPool.stage,
                  poolTokenValue: vesperPool.tokenValue,
                  poolTotalValueLocked: vesperPool.totalValue,
                  poolType: vesperPool.type,
                  poolWithdrawFee: vesperPool.withdrawFee,
                  rewardDuration,
                  rewardTokenAmount: rewardAmount.toString(),
                  rewardTokenAmountInUSD,
                  rewardTokenPoolAddress,
                  rewardTokenPoolDecimals,
                  rewardTokenPoolName,
                  rewardTokenPriceInUSD,
                  rewardTokenSymbol,
                  sk,
                  strategyAddress,
                  strategyName,
                  transactionHash: rewardAddedEvent.transactionHash,
                  updatedAt: Date.now(),
                };

                try {
                  const existingItem = await this.poolRewardEventRepository.getPoolRewardEvent({
                    blockNumber: rewardAddedEvent.blockNumber,
                    poolContractAddress: poolDefinition.pool.proxy,
                    transactionHash: rewardAddedEvent.transactionHash,
                  });

                  id = (existingItem as any)?.id;
                  createdAt = (existingItem as any)?.createdAt.value
                    ? new Date(Number((existingItem as any).createdAt.value)).getTime()
                    : new Date().getTime();
                  sk = `POOL_REWARD_EVENT#${id}`;

                  return await this.poolRewardEventRepository.updateItem({
                    entity: {
                      ...rewardEntity,
                      createdAt,
                      id,
                      sk,
                    } as any,
                    key: {
                      pk,
                      sk,
                    },
                  });
                } catch (err) {
                  if (err instanceof NotFoundError) {
                    return this.poolRewardEventRepository.putItem(rewardEntity as any);
                  } else {
                    throw err;
                  }
                }
              },
              // { concurrency: 1 },
            );
          },
          // { concurrency: 1 },
        );
      },
      // { concurrency: 1 },
    );

    const rewardsUpserted = results.flat().filter(Boolean);

    this.logger.debug('Finished scanning pool rewards', {
      rewardsUpsertedLength: rewardsUpserted.length,
      skippedBecauseCouldNotFindPool,
      skippedBecauseCouldNotFindPriceData,
      skippedBecauseCouldNotParseLog: skippedBecauseCouldNotParseLog.length,
      skippedBecauseRewardTokenIsVSP: skippedBecauseRewardTokenIsVSP.length,
      skippedBecauseRewardTokenMissing,
    });
  }
}
