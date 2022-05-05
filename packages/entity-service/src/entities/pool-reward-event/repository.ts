import { Service } from 'typedi';
import { BaseRepository } from '../base-entity/index';
import { PoolRewardEvent } from './entity';

export interface GetPoolRewardEventsByBlockchainProps {
  network?: string;
  poolContractVersion?: string;
}

@Service()
export class PoolRewardEventRepository extends BaseRepository<PoolRewardEvent> {
  async getPoolRewardEventsByNetwork({ network, poolContractVersion }: GetPoolRewardEventsByBlockchainProps) {
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

  async getPoolRewardEventsByPool(poolName: string) {
    return this.query({
      expressionAttributeValues: {
        ':pk': `POOL#${poolName}`,
        ':sk': 'POOL_REWARD_EVENT#',
      },
      keyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
      limit: 10,
      sort: 'desc',
    });
  }
}
