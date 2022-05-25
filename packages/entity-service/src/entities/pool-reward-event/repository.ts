import { NotFoundError } from '@vesper-discord/errors';
import { Service } from 'typedi';
import { BaseRepository } from '../base-entity/index';
import { PoolRewardEvent } from './entity';

export interface GetPoolRewardEventsByBlockchainProps {
  network?: string;
  poolContractVersion?: string;
}

export interface GetPoolRewardEventsByPoolProps {
  poolContractAddress: string;
  poolContractVersion?: string;
}

export interface GetPoolRewardEventProps {
  poolContractAddress: string;
  blockNumber: number;
  transactionHash: string;
}

@Service()
export class PoolRewardEventRepository extends BaseRepository<PoolRewardEvent> {
  public async getPoolRewardEventsByNetwork({ network, poolContractVersion }: GetPoolRewardEventsByBlockchainProps) {
    return this.query({
      expressionAttributeValues: {
        ':pk': `NETWORK#${network}`,
        ':poolContractVersion': poolContractVersion,
        ':sk': 'POOL_REWARD_EVENT#',
      },
      filterExpression: poolContractVersion ? `contains(poolContractVersion, :poolContractVersion)` : undefined,
      indexName: 'GSI3',
      keyConditionExpression: 'GSI3pk = :pk and begins_with(GSI3sk, :sk)',
      limit: 10,
      sort: 'desc',
    });
  }

  public async getPoolRewardEventsByPool({ poolContractAddress, poolContractVersion }: GetPoolRewardEventsByPoolProps) {
    return this.query({
      expressionAttributeValues: {
        ':pk': `POOL#${poolContractAddress.toLowerCase()}`,
        ':poolContractVersion': poolContractVersion,
        ':sk': 'POOL_REWARD_EVENT#',
      },
      filterExpression: poolContractVersion ? `contains(poolContractVersion, :poolContractVersion)` : undefined,
      keyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
      limit: 10,
      sort: 'desc',
    });
  }

  async getPoolRewardEvent({ poolContractAddress, blockNumber, transactionHash }: GetPoolRewardEventProps) {
    const results = await this.query({
      expressionAttributeValues: {
        ':pk': `POOL#${poolContractAddress.toLowerCase()}`,
        ':sk': `BLOCK_NUMBER#${blockNumber}#TRANSACTION_HASH#${transactionHash}`,
      },
      indexName: 'GSI4',
      keyConditionExpression: 'GSI4pk = :pk and begins_with(GSI4sk, :sk)',
      limit: 1,
      sort: 'desc',
    });

    if (results.length === 0) {
      throw new NotFoundError('Could not find PoolRewardEvent', {
        blockNumber,
        poolContractAddress,
        transactionHash,
      });
    }

    return results[0];
  }
}
