import { setupContainer as setupAwsContainer } from '@vesper-discord/aws';
import type { Context, DynamoDBStreamEvent } from 'aws-lambda';
import { Container } from 'typedi';
import { handler } from '../index';
describe('reward-added-event-handler | handler', () => {
  const container = Container.of('test');

  beforeEach(() => {
    container.reset();
    setupAwsContainer({ container });
  });

  it('should send a message to discord', async () => {
    const streamEvent: DynamoDBStreamEvent = {
      Records: [
        {
          awsRegion: 'us-west-2',
          dynamodb: {
            ApproximateCreationDateTime: 1651447958,
            Keys: {
              pk: { S: 'POOL#veETH-DAI Earn Pool' },
              sk: {
                S: 'POOL_REWARD_EVENT#BLOCK_NUMBER#14691452#ID#0x5a2e2cf4ee4c1e80764d67c5bbd3c84004b96255b76a986ea4ec294d384c5823',
              },
            },
            NewImage: {
              GSI2pk: { S: 'POOL_STRATEGY#EarnVesperStrategyETHDAI' },
              GSI2sk: {
                S: 'POOL_REWARD_EVENT#BLOCK_NUMBER#14691452#ID#0x5a2e2cf4ee4c1e80764d67c5bbd3c84004b96255b76a986ea4ec294d384c5823',
              },
              GSI3pk: { S: 'NETWORK#mainnet' },
              GSI3sk: {
                S: 'POOL_REWARD_EVENT#BLOCK_NUMBER#14691452#ID#0x5a2e2cf4ee4c1e80764d67c5bbd3c84004b96255b76a986ea4ec294d384c5823',
              },
              baseTokenAddress: { S: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
              baseTokenAmount: { N: '1930.8288204777682' },
              baseTokenAmountInUSD: { N: '1934.6904781187238' },
              baseTokenName: { S: 'Dai Stablecoin' },
              baseTokenPriceInUSD: { N: '1.002' },
              baseTokenSymbol: { S: 'DAI' },
              baseTokenTotalValueLocked: { S: '7938745.104659018156433642' },
              baseTokenTotalValueLockedInUSD: { N: '7954622.594868336' },
              baseTokenValue: { S: '1.056035927997417588' },
              blockNumber: { N: '14691452' },
              blockTimestamp: { N: '1651401138' },
              id: {
                S: '0x5a2e2cf4ee4c1e80764d67c5bbd3c84004b96255b76a986ea4ec294d384c5823',
              },
              network: { S: 'mainnet' },
              pk: { S: 'POOL#veETH-DAI Earn Pool' },
              poolContractVersion: { S: '4.0.1' },
              poolName: { S: 'veETH-DAI Earn Pool' },
              poolProxyContractAddress: {
                S: '0xA89566489E932a2d334b9eFF7884Feb21a07d2B3',
              },
              poolRewardsProxyContractAddress: {
                S: '0xb37eb47cc76C03C6A0C02C8DaED5dB18b96A2448',
              },
              rewardAmount: { S: '1828.374176756692426614' },
              rewardDuration: { N: '604800' },
              rewardTokenPoolAddress: {
                S: '0x0538C8bAc84E95A9dF8aC10Aad17DbE81b9E36ee',
              },
              rewardTokenPoolName: { S: 'vaDAI Pool' },
              rewardTokenSymbol: { S: 'vaDAI' },
              sk: {
                S: 'POOL_REWARD_EVENT#BLOCK_NUMBER#14691452#ID#0x5a2e2cf4ee4c1e80764d67c5bbd3c84004b96255b76a986ea4ec294d384c5823',
              },
              strategyAddress: { S: '0x58DDe7CE67099C797f247dfB6f76dDF3235CDEbf' },
              strategyName: { S: 'EarnVesperStrategyETHDAI' },
              transactionId: {
                S: '0x5a2e2cf4ee4c1e80764d67c5bbd3c84004b96255b76a986ea4ec294d384c5823',
              },
              type: { S: 'POOL_REWARD_EVENT' },
            },
            SequenceNumber: '86886000000000032420836731',
            SizeBytes: 1543,
            StreamViewType: 'NEW_AND_OLD_IMAGES',
          },
          eventID: '75991b4dc324d6fccdde8d1eeede192a',
          eventName: 'INSERT',
          eventSource: 'aws:dynamodb',
          eventSourceARN:
            'arn:aws:dynamodb:us-west-2:702592220884:table/SharedResourcesStack-DatabaseVesperSingleTable00BF6414-173Y2MIAPFJ22/stream/2022-05-01T04:53:39.213',
          eventVersion: '1.1',
        },
      ],
    };

    const result = await handler(streamEvent, {} as Context);

    expect(result).toBeUndefined();
  });
});
