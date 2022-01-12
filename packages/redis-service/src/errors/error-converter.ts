import { ErrorConverter, ErrorConverterConvertErrorProps } from '@vesper-discord/errors';
import { ExtendedRedisError, RedisError } from './error';
import { RedisInvalidRequestError } from './invalid-request-error';

export class RedisErrorConverter implements ErrorConverter<RedisError> {
  convertError(props: ErrorConverterConvertErrorProps<RedisError>) {
    let resultError;

    const code = props.error?.raw?.code ?? props.error?.code ?? props.error?.raw?.type;
    const message = props.message ?? props.error.message ?? 'Redis Error';

    switch (code) {
      case 'invalid_request_error':
        resultError = new RedisInvalidRequestError(message, props);
        break;

      default:
        resultError = new ExtendedRedisError(message, props);
    }

    return resultError;
  }
}
