import { Inject, Service, Token } from 'typedi';
import { DynamoDBClient as AWSDynamoDBClient } from '@aws-sdk/client-dynamodb';
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
} from '@aws-sdk/lib-dynamodb';
import { Log } from '@vesper-discord/logger';
import { ErrorHandler } from '@vesper-discord/errors';
import { Retriable } from '@vesper-discord/retry';
import { AwsErrorConverter } from '../../errors';

export const AWSDynamoDBClientToken = new Token('AWSDynamoDBClient');

@Service()
export class DynamoDBClient {
  @Inject(AWSDynamoDBClientToken)
  private client!: AWSDynamoDBClient;

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
      convertEmptyValues: false,

      // false, by default.
      // Whether to remove undefined values while marshalling.
      removeUndefinedValues: false, // false, by default.
    };

    const unmarshallOptions = {
      // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
      wrapNumbers: false, // false, by default.
    };

    const translateConfig = { marshallOptions, unmarshallOptions };

    this._documentClient = DynamoDBDocumentClient.from(this.client, translateConfig);
    return this._documentClient;
  }

  @Log({ category: 'aws.dynamo-db' })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async getItem(props: GetCommandInput) {
    return this.documentClient.send(new GetCommand(props));
  }

  @Log({ category: 'aws.dynamo-db' })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async deleteItem(props: DeleteCommandInput) {
    return this.documentClient.send(new DeleteCommand(props));
  }

  @Log({ category: 'aws.dynamo-db' })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async query(props: QueryCommandInput) {
    return this.documentClient.send(new QueryCommand(props));
  }

  @Log({ category: 'aws.dynamo-db' })
  @Retriable()
  @ErrorHandler({ converter: AwsErrorConverter })
  public async putItem(props: PutCommandInput) {
    return this.documentClient.send(new PutCommand(props));
  }
}
