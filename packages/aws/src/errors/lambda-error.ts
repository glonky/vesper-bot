import type { Context, APIGatewayProxyEventV2, SNSEvent, SQSEvent } from 'aws-lambda';
import { ExtendedError, ExtendedErrorProps } from '@vesper-discord/errors';

export interface AwsLambdaErrorProps extends ExtendedErrorProps {
  context: Context;
  event: APIGatewayProxyEventV2 | SNSEvent | SQSEvent | any;
}

export class AwsLambdaError extends ExtendedError {
  constructor(message: string, props: AwsLambdaErrorProps) {
    super(message, props);

    Object.setPrototypeOf(this, AwsLambdaError.prototype);
    this.name = this.constructor.name;
  }
}
