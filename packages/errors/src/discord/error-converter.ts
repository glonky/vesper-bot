import { ErrorConverter, ErrorConverterConvertErrorProps } from '../error-converter';
import { NotFoundError } from '../not-found-error';
import { DiscordNonRetriableError } from './non-retriable-error';
import { DiscordRetriableError } from './retriable-error';
import { DiscordError } from './error';

export class DiscordErrorConverter implements ErrorConverter<DiscordError> {
  convertError(props: ErrorConverterConvertErrorProps<DiscordError>) {
    let resultError;

    const discordError = props.error;
    const message = props.error.message ?? 'Discord Error';

    const name = discordError?.code;
    const retryable = discordError?.retryable ?? false;

    // TODO: This does not work...
    switch (name) {
      case 'ExecutionDoesNotExist': {
        resultError = new NotFoundError(message, props);
        break;
      }
      case 'StatementTimeoutException': {
        resultError = new DiscordRetriableError(message, props);
        break;
      }
      default: {
        resultError = retryable
          ? new DiscordRetriableError(message, props)
          : new DiscordNonRetriableError(message, props);
      }
    }

    return resultError;
  }
}
