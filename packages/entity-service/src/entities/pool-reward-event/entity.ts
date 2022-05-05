import { BaseEntity } from '../base-entity/index';
import { Pool } from '../pool/entity';

export interface PoolRewardProps {
  pool: Pool;
}

export class PoolRewardEvent extends BaseEntity {
  private pool: Pool;

  constructor(props: PoolRewardProps) {
    super({
      ...props,
      attributes: {
        pk: '',
        // id: { partitionKey: true },
      },
      name: 'PoolReward',
      // partitionKey: `${props.pool.getPartitionKey()}`,
      // sortKey: `${}`,
    });
    this.pool = props.pool;
  }
}
