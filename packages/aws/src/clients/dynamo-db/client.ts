import { Inject, Service, Token } from 'typedi';
import { DynamoDBClient as AWSDynamoDBClient } from '@aws-sdk/client-dynamodb';
import { omitBy, isNil } from 'lodash';
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  DeleteCommandInput,
  GetCommand,
  GetCommandInput,
  PutCommandInput,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Log, Logger, LoggerDecorator } from '@vesper-discord/logger';
import { ErrorHandler } from '@vesper-discord/errors';
import { Retriable } from '@vesper-discord/retry';
import { AwsErrorConverter } from '../../errors/index';

export const AWSDynamoDBClientToken = new Token('AWSDynamoDBClient');

@Service()
export class DynamoDBClient {
  @Inject(AWSDynamoDBClientToken)
  private readonly client!: AWSDynamoDBClient;

  @LoggerDecorator()
  private readonly logger!: Logger;

  private _documentClient!: DynamoDBDocumentClient;

  private get documentClient() {
    if (this._documentClient) {
      return this._documentClient;
    }

    const marshallOptions = {
      // false, by default.
      // Whether to convert typeof object to map attribute.
      convertClassInstanceToMap: false,

      // Whether to automatically convert empty strings, blobs, and sets to `null`.
      convertEmptyValues: true,

      // false, by default.
      // Whether to remove undefined values while marshalling.
      removeUndefinedValues: true, // false, by default.
    };

    const unmarshallOptions = {
      // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
      wrapNumbers: true, // false, by default.
    };

    const translateConfig = { marshallOptions, unmarshallOptions };

    this._documentClient = DynamoDBDocumentClient.from(this.client, translateConfig);
    return this._documentClient;
  }

  @Log({
    logInput: ({ input }) => ({ pk: input[0].pk, sk: input[0].sk }),
    logResult: ({ result }) => ({
      consumedCapacityAttributes: result.ConsumedCapacityAttributes,
    }),
  })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async getItem(props: GetCommandInput) {
    return this.documentClient.send(
      new GetCommand({
        ...props,
        ReturnConsumedCapacity: 'TOTAL',
      }),
    );
  }

  @Log({
    logInput: ({ input }) => input[0],
    logResult: ({ result }) => ({
      consumedCapacityAttributes: result.ConsumedCapacityAttributes,
    }),
  })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async scan(props: ScanCommandInput) {
    return this.documentClient.send(
      new ScanCommand({
        ...props,
        ReturnConsumedCapacity: 'TOTAL',
      }),
    );
  }

  @Log({
    logInput: ({ input }) => input[0],
    logResult: ({ result }) => ({
      consumedCapacityAttributes: result.ConsumedCapacityAttributes,
      itemCollectionMetrics: result.ItemCollectionMetrics,
    }),
  })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async deleteItem(props: DeleteCommandInput) {
    return this.documentClient.send(
      new DeleteCommand({
        ...props,
        ReturnConsumedCapacity: 'TOTAL',
        ReturnItemCollectionMetrics: 'SIZE',
      }),
    );
  }

  @Log({
    logInput: ({ input }) => input[0],
    logResult: ({ result }) => ({
      consumedCapacity: omitBy(
        result.ConsumedCapacity,
        (value, key) => isNil(value) || key === 'TableName' || key === 'Table',
      ),
      count: result.Count,
      scannedCount: result.ScannedCount,
    }),
  })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async query(props: QueryCommandInput) {
    return this.documentClient.send(
      new QueryCommand({
        ...props,
        ReturnConsumedCapacity: 'TOTAL',
      }),
    );
  }

  @Log({
    logInput: ({ input }) => ({ pk: input[0].Item.pk, sk: input[0].Item.sk }),
    logResult: ({ result }) => ({
      consumedCapacity: omitBy(
        result.ConsumedCapacity,
        (value, key) => isNil(value) || key === 'TableName' || key === 'Table',
      ),
      itemCollectionMetrics: omitBy(result.ItemCollectionMetrics, isNil),
    }),
  })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async putItem(props: PutCommandInput) {
    return this.documentClient.send(
      new PutCommand({
        ...props,
        ReturnConsumedCapacity: 'TOTAL',
        ReturnItemCollectionMetrics: 'SIZE',
      }),
    );
  }
}
