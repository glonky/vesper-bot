import { Inject, Service } from 'typedi';
import { Log, Logger, LoggerDecorator } from '@vesper-discord/logger';
import { DynamoDBClient } from '@vesper-discord/aws';
import { Config } from '../../config';
import { BaseEntity } from './entity';

export interface QueryProps {
  sort?: 'asc' | 'desc';
  indexName?: string;
  expressionAttributeValues: { [key: string]: any };
  keyConditionExpression: string;
  filterExpression?: string;
  limit?: number;
}

@Service()
export class BaseRepository<Entity extends BaseEntity> {
  @Inject()
  private readonly client!: DynamoDBClient;

  @LoggerDecorator()
  private readonly logger!: Logger;

  @Inject(() => Config)
  private readonly config!: Config;

  @Log()
  public async putItem(entity: Entity): Promise<Entity> {
    const result = await this.client.putItem({
      Item: {
        // entity: entity.getEntityName(),
        // ...entity.getSecondaryIndexes(),
        // ...entity.attributes,
        ...entity,
      },

      TableName: this.config.aws.resources.tables.vesperSingleTable, // TODO: Where is this coming from?
    });

    // serialize/deserialize into the correct format before/after?
    return result.Attributes as Entity;
  }

  @Log()
  public async getItem() {
    const result = await this.client.getItem({
      Key: {
        pk: '',
      },
      TableName: this.config.aws.resources.tables.vesperSingleTable,
    });

    return result.Item as Entity;
  }

  @Log()
  public async query(props: QueryProps): Promise<Entity[]> {
    const result = await this.client.query({
      ExpressionAttributeValues: props.expressionAttributeValues,
      FilterExpression: props.filterExpression,
      IndexName: props.indexName,
      KeyConditionExpression: props.keyConditionExpression,
      ScanIndexForward: props.sort === 'desc' ? false : true,
      TableName: this.config.aws.resources.tables.vesperSingleTable,
    });

    return result.Items as Entity[];
  }
}
