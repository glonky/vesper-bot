import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';

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
      timeToLiveAttribute: 'ttl',
    });

    this.vesperSingleTable = {
      table: singleTable,
    };

    singleTable.addGlobalSecondaryIndex({
      indexName: 'gsi1',
      partitionKey: { name: 'sk', type: AttributeType.STRING },
      sortKey: { name: 'pk', type: AttributeType.STRING },
    });

    singleTable.addGlobalSecondaryIndex({
      indexName: 'gsi2',
      partitionKey: { name: 'gsi2pk', type: AttributeType.STRING },
      sortKey: { name: 'gsi2sk', type: AttributeType.STRING },
    });
  }
}
