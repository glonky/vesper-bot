import { NotFoundError, ErrorConverter, ErrorConverterConvertErrorProps } from '@vesper-discord/errors';
import { AwsNonRetriableError } from './non-retriable-error';
import { AwsRetriableError } from './retriable-error';
import { AwsError } from './error';

export class AwsErrorConverter implements ErrorConverter<AwsError> {
  convertError(props: ErrorConverterConvertErrorProps<AwsError>) {
    let resultError;

    const awsError = props.error;
    const message = props.error.message ?? 'AWS Error';

    const name = awsError?.code;
    const retryable = awsError?.retryable ?? false;
    // Handle Gone Exception when posting
    // const error = {
    //   $fault: 'client',
    //   $metadata: {
    //     attempts: 1,
    //     httpStatusCode: 410,
    //     requestId: '123456789',
    //     totalRetryDelay: 0,
    //   },
    //   errorMessage: 'UnknownError',
    //   errorType: 'GoneException',
    //   message: 'UnknownError',
    //   name: 'GoneException',
    //   stack: ['hi'],
    // };
    // TODO: This does not work...
    // switch (err.code) {
    //   case 'InternalServerError':
    //     console.error(`Internal Server Error, generally safe to retry with exponential back-off. Error: ${err.message}`);
    //     return;
    //   case 'ProvisionedThroughputExceededException':
    //     console.error(`Request rate is too high. If you're using a custom retry strategy make sure to retry with exponential back-off. `
    //       + `Otherwise consider reducing frequency of requests or increasing provisioned capacity for your table or secondary index. Error: ${err.message}`);
    //     return;
    //   case 'ResourceNotFoundException':
    //     console.error(`One of the tables was not found, verify table exists before retrying. Error: ${err.message}`);
    //     return;
    //   case 'ServiceUnavailable':
    //     console.error(`Had trouble reaching DynamoDB. generally safe to retry with exponential back-off. Error: ${err.message}`);
    //     return;
    //   case 'ThrottlingException':
    //     console.error(`Request denied due to throttling, generally safe to retry with exponential back-off. Error: ${err.message}`);
    //     return;
    //   case 'UnrecognizedClientException':
    //     console.error(`The request signature is incorrect most likely due to an invalid AWS access key ID or secret key, fix before retrying. `
    //       + `Error: ${err.message}`);
    //     return;
    //   case 'ValidationException':
    //     console.error(`The input fails to satisfy the constraints specified by DynamoDB, `
    //       + `fix input before retrying. Error: ${err.message}`);
    //     return;
    //   case 'RequestLimitExceeded':
    //     console.error(`Throughput exceeds the current throughput limit for your account, `
    //       + `increase account level throughput before retrying. Error: ${err.message}`);
    //     return;
    //   default:
    //     console.error(`An exception occurred, investigate and configure retry strategy. Error: ${err.message}`);
    //     return;
    switch (name) {
      case 'ExecutionDoesNotExist': {
        resultError = new NotFoundError(message, props);
        break;
      }
      case 'StatementTimeoutException': {
        resultError = new AwsRetriableError(message, props);
        break;
      }
      default: {
        resultError = retryable ? new AwsRetriableError(message, props) : new AwsNonRetriableError(message, props);
      }
    }

    return resultError;
  }
}
