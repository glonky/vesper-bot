/* eslint-disable no-prototype-builtins */
import { Inject, Service } from 'typedi';
import { Log, Logger, LoggerDecorator } from '@vesper-discord/logger';
import { DynamoDBClient } from '@vesper-discord/aws';
import { NotFoundError } from '@vesper-discord/errors';
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

export interface UpdateItemProps<Entity extends BaseEntity> {
  entity: Entity;
  key: { [key: string]: any };
}

export interface GetItemProps {
  pk: string;
  sk?: string;
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
  public async updateItem(props: UpdateItemProps<Entity>): Promise<Entity> {
    // TODO: This doesn't work because of name key collision
    const expressionAttributeValues = Object.entries(props.entity).reduce((acc, [key, value]) => {
      if (key !== 'pk' && key !== 'sk' && props.entity.hasOwnProperty(key) && value !== undefined) {
        acc[`:${key}`] = value;
      }

      return acc;
    }, {} as any);

    const updateExpression = Object.keys(props.entity)
      .filter(
        (key) =>
          key !== 'pk' && key !== 'sk' && props.entity.hasOwnProperty(key) && (props.entity as any)[key] !== undefined,
      )
      .map((key) => `${key} = :${key}`)
      .join(', ');

    const result = await this.client.updateItem({
      ExpressionAttributeValues: expressionAttributeValues,
      Key: props.key,
      TableName: this.config.aws.resources.tables.vesperSingleTable,
      UpdateExpression: `SET ${updateExpression}`,
    });

    // serialize/deserialize into the correct format before/after?
    return result.Attributes as Entity;
  }

  @Log()
  public async getItem(props: GetItemProps) {
    const result = await this.client.getItem({
      Key: {
        pk: props.pk,
        sk: props.sk,
      },
      TableName: this.config.aws.resources.tables.vesperSingleTable,
    });

    if (!result.Item) {
      throw new NotFoundError(`Entity not found`, {
        pk: props.pk,
        sk: props.sk,
      });
    }

    return result.Item as Entity;
  }

  @Log()
  public async query(props: QueryProps): Promise<Entity[]> {
    const result = await this.client.query({
      ExpressionAttributeValues: props.expressionAttributeValues,
      FilterExpression: props.filterExpression,
      IndexName: props.indexName,
      KeyConditionExpression: props.keyConditionExpression,
      Limit: props.limit,
      ScanIndexForward: props.sort === 'desc' ? false : true,
      TableName: this.config.aws.resources.tables.vesperSingleTable,
    });

    return result.Items as Entity[];
  }
}
