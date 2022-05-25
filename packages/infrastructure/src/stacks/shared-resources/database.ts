import { Construct } from 'constructs';
import { AttributeType, BillingMode, StreamViewType, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';

export class Database extends Construct {
  public readonly vesperSingleTable: {
    table: Table;
  };

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const singleTable = new Table(this, 'VesperSingleTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      contributorInsightsEnabled: true,
      encryption: TableEncryption.AWS_MANAGED,
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'ttl',
    });

    this.vesperSingleTable = {
      table: singleTable,
    };

    singleTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'sk', type: AttributeType.STRING },
      sortKey: { name: 'pk', type: AttributeType.STRING },
    });

    singleTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2pk', type: AttributeType.STRING },
      sortKey: { name: 'GSI2sk', type: AttributeType.STRING },
    });

    singleTable.addGlobalSecondaryIndex({
      indexName: 'GSI3',
      partitionKey: { name: 'GSI3pk', type: AttributeType.STRING },
      sortKey: { name: 'GSI3sk', type: AttributeType.STRING },
    });

    singleTable.addGlobalSecondaryIndex({
      indexName: 'GSI4',
      partitionKey: { name: 'GSI4pk', type: AttributeType.STRING },
      sortKey: { name: 'GSI4sk', type: AttributeType.STRING },
    });
  }
}
