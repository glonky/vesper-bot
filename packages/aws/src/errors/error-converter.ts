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
